<?php

namespace App\Http\Controllers\Api;

use App\Mail\LibraryEventMail;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    private function formatCartItem(CartItem $item): array
    {
        $item->loadMissing('book');
        $unitPrice = $item->book->price ?? 0;

        return [
            'id' => $item->id,
            'book_id' => $item->book_id,
            'quantity' => $item->quantity,
            'unit_price' => round($unitPrice, 2),
            'line_total' => round($unitPrice * $item->quantity, 2),
            'book' => $item->book,
        ];
    }

    private function cartSummary($cartItems): array
    {
        $subtotal = $cartItems->sum(fn (CartItem $item) => ($item->book->price ?? 0) * $item->quantity);
        $tax = round($subtotal * 0.05, 2);
        $total = round($subtotal + $tax, 2);

        return [
            'items_count' => (int) $cartItems->sum('quantity'),
            'subtotal' => round($subtotal, 2),
            'tax' => $tax,
            'total' => $total,
        ];
    }

    public function cart(Request $request)
    {
        $items = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->with('book')
            ->latest()
            ->get();

        return response()->json([
            'items' => $items->map(fn (CartItem $item) => $this->formatCartItem($item)),
            'summary' => $this->cartSummary($items),
        ]);
    }

    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|integer',
            'quantity' => 'nullable|integer|min:1|max:10',
        ]);

        Book::findOrFail($validated['book_id']);

        $item = CartItem::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'book_id' => $validated['book_id'],
            ],
            [
                'quantity' => 0,
            ]
        );

        $item->quantity += $validated['quantity'] ?? 1;
        $item->save();

        return response()->json([
            'message' => 'Book added to cart',
            'item' => $item->load('book'),
        ]);
    }

    public function updateCartItem(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $item = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $item->update([
            'quantity' => $validated['quantity'],
        ]);

        return response()->json([
            'message' => 'Cart updated successfully',
            'item' => $item->load('book'),
        ]);
    }

    public function removeCartItem(Request $request, $id)
    {
        $item = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $item->delete();

        return response()->json([
            'message' => 'Item removed from cart',
        ]);
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['card', 'upi', 'netbanking', 'wallet'])],
        ]);

        $user = $request->user();
        $cartItems = CartItem::query()
            ->where('user_id', $user->id)
            ->with('book')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty',
            ], 422);
        }

        $summary = $this->cartSummary($cartItems);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-' . strtoupper(Str::random(10)),
            'subtotal' => $summary['subtotal'],
            'tax' => $summary['tax'],
            'total' => $summary['total'],
            'currency' => 'INR',
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
            'status' => 'initiated',
        ]);

        foreach ($cartItems as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'book_id' => $item->book_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->book->price ?? 0,
                'line_total' => ($item->book->price ?? 0) * $item->quantity,
            ]);
        }

        $keyId = config('services.razorpay.key_id', env('RAZORPAY_KEY_ID'));
        $keySecret = config('services.razorpay.key_secret', env('RAZORPAY_KEY_SECRET'));

        if (!$keyId || !$keySecret) {
            return response()->json([
                'message' => 'Razorpay keys are not configured on the server',
            ], 500);
        }

        $razorpayResponse = Http::withBasicAuth($keyId, $keySecret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => (int) round($summary['total'] * 100),
                'currency' => 'INR',
                'receipt' => $order->order_number,
                'notes' => [
                    'local_order_id' => (string) $order->id,
                    'customer_email' => $user->email,
                ],
            ]);

        if (!$razorpayResponse->successful()) {
            $order->update([
                'status' => 'failed',
            ]);

            return response()->json([
                'message' => 'Failed to create Razorpay order',
                'details' => $razorpayResponse->json(),
            ], 500);
        }

        $razorpayOrder = $razorpayResponse->json();

        $order->update([
            'razorpay_order_id' => $razorpayOrder['id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Razorpay order created successfully',
            'key' => $keyId,
            'checkout' => [
                'order_id' => $razorpayOrder['id'] ?? null,
                'amount' => $razorpayOrder['amount'] ?? 0,
                'currency' => $razorpayOrder['currency'] ?? 'INR',
                'name' => 'Smart Library Hub',
                'description' => 'Book purchase checkout',
                'prefill' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'notes' => [
                    'local_order_id' => (string) $order->id,
                ],
            ],
            'order' => $order->load('items.book'),
        ]);
    }

    public function verifyCheckout(Request $request)
    {
        $validated = $request->validate([
            'local_order_id' => 'required|integer',
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $order = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items.book')
            ->findOrFail($validated['local_order_id']);

        $keySecret = config('services.razorpay.key_secret', env('RAZORPAY_KEY_SECRET'));

        if (!$keySecret) {
            return response()->json([
                'message' => 'Razorpay key secret is not configured on the server',
            ], 500);
        }

        $generatedSignature = hash_hmac(
            'sha256',
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'],
            $keySecret
        );

        if (!hash_equals($generatedSignature, $validated['razorpay_signature'])) {
            $order->update([
                'payment_status' => 'failed',
                'status' => 'failed',
            ]);

            return response()->json([
                'message' => 'Payment signature verification failed',
            ], 422);
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'razorpay_order_id' => $validated['razorpay_order_id'],
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
            'razorpay_signature' => $validated['razorpay_signature'],
        ]);

        UserNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'Payment Successful',
            'message' => "Your order {$order->order_number} was paid successfully and your books are now unlocked.",
            'type' => 'success',
            'is_read' => false,
            'created_at' => now(),
        ]);

        try {
            Mail::to($request->user()->email)->send(
                new LibraryEventMail(
                    'Payment Successful',
                    'Your payment has been confirmed',
                    "Order {$order->order_number} was paid successfully. Your purchased books are now unlocked in your profile library.",
                    [
                        'Order Number' => $order->order_number,
                        'Amount Paid' => 'Rs. ' . number_format((float) $order->total, 2),
                        'Items' => (string) $order->items->count(),
                    ]
                )
            );
        } catch (\Throwable $exception) {
            report($exception);
        }

        CartItem::query()->where('user_id', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Payment verified successfully',
            'order' => $order->fresh()->load('items.book'),
        ]);
    }

    public function orders(Request $request)
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items.book'])
            ->latest()
            ->get();

        return response()->json($orders);
    }
}

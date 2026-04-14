<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
</head>
<body style="margin:0;padding:0;background:#f7efe7;font-family:Segoe UI,Arial,sans-serif;color:#231815;">
    <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
        <div style="background:#fffdf9;border:1px solid rgba(74,47,34,0.12);border-radius:28px;padding:32px;box-shadow:0 24px 60px rgba(93,58,38,0.10);">
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(208,93,49,0.12);color:#d05d31;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                Smart Library Hub
            </div>

            <h1 style="margin:18px 0 12px;font-size:28px;line-height:1.2;">{{ $heading }}</h1>
            <p style="margin:0 0 18px;line-height:1.7;color:#6f6159;">{{ $messageText }}</p>

            @if(!empty($meta))
                <div style="border-radius:20px;background:#f8f1ea;border:1px solid rgba(74,47,34,0.10);padding:18px 20px;margin-top:18px;">
                    @foreach($meta as $label => $value)
                        <p style="margin:0 0 10px;line-height:1.6;color:#4a352b;">
                            <strong>{{ $label }}:</strong> {{ $value }}
                        </p>
                    @endforeach
                </div>
            @endif

            <p style="margin:22px 0 0;line-height:1.7;color:#6f6159;">
                You are receiving this email because an event happened in your Smart Library Hub account.
            </p>
        </div>
    </div>
</body>
</html>

"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const sizes = [160, 220, 320, 440];

export default function Home() {
  const [value, setValue] = useState("https://qrcode.studio");
  const [size, setSize] = useState(320);
  const [qrImage, setQrImage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!value.trim()) return;

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#171525", light: "#ffffff" },
    })
      .then((image) => {
        if (isCurrent) {
          setQrImage(image);
          setError("");
        }
      })
      .catch(() => {
        if (isCurrent) {
          setQrImage("");
          setError("That content is too long to fit in a QR code.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [value, size]);

  const downloadQr = () => {
    if (!qrImage) return;
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "qrcode.png";
    link.click();
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not access the clipboard. You can still copy the text manually.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8f7fb] text-[#171525]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-44 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-[#e9e3ff] opacity-70 blur-3xl"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <a href="#" className="flex items-center gap-2.5" aria-label="QR Studio home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d4aff] text-white shadow-lg shadow-[#6d4aff]/20">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14h3v3h-3zM19 14v2M17 19h3M14 19v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[15px] font-bold tracking-tight">qr<span className="text-[#7659eb]">studio</span></span>
        </a>
        <span className="hidden items-center gap-2 rounded-full border border-[#e9e6f2] bg-white/70 px-3.5 py-2 text-xs font-medium text-[#6d687c] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#35b888]" />
          Free forever · No sign-up
        </span>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-12 pt-10 sm:px-10 sm:pt-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e7e2f4] bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-[#6e52d9]">
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="m10 2 1.7 5.3L17 9l-5.3 1.7L10 16l-1.7-5.3L3 9l5.3-1.7L10 2Z" fill="currentColor" />
              <path d="m16 13 .8 2.2L19 16l-2.2.8L16 19l-.8-2.2L13 16l2.2-.8L16 13Z" fill="currentColor" />
            </svg>
            YOUR QR, YOUR WAY
          </div>
          <h1 className="text-4xl font-bold tracking-[-0.045em] text-[#19172a] sm:text-5xl">
            Make it scannable.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#777386] sm:text-lg">
            Turn any link or message into a QR code. Ready to download in seconds.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-3xl border border-[#ebe9f1] bg-white p-6 shadow-[0_18px_60px_-36px_rgba(46,36,86,0.25)] sm:p-8">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Your content</h2>
                <p className="mt-1 text-sm text-[#8b8798]">Paste a URL or type any text</p>
              </div>
              <span className="rounded-lg bg-[#f4f1ff] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#7659eb]">Step 01</span>
            </div>

            <label htmlFor="qr-content" className="mb-2 block text-sm font-semibold text-[#383548]">
              Link or text
            </label>
            <div className="relative">
              <textarea
                id="qr-content"
                value={value}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setValue(nextValue);
                  if (!nextValue.trim()) {
                    setQrImage("");
                    setError("");
                  }
                }}
                placeholder="https://example.com"
                rows={5}
                maxLength={2953}
                className="w-full resize-y rounded-2xl border border-[#e9e7ef] bg-[#fbfaff] px-4 py-3.5 text-sm leading-6 text-[#29263a] outline-none transition placeholder:text-[#b5b1c1] focus:border-[#927bfa] focus:ring-4 focus:ring-[#7659eb]/10"
              />
              <span className="absolute bottom-3 right-3 rounded-md bg-white px-2 py-1 text-[11px] text-[#a09bad]">
                {value.length} / 2953
              </span>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <label htmlFor="qr-size" className="text-sm font-semibold text-[#383548]">Image size</label>
                <span className="text-xs font-medium text-[#9691a3]">PNG format</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                      size === option
                        ? "border-[#7659eb] bg-[#f5f2ff] text-[#6848e5] ring-2 ring-[#7659eb]/10"
                        : "border-[#eeecf3] bg-white text-[#777386] hover:border-[#cfc6f5] hover:bg-[#fbfaff]"
                    }`}
                  >
                    {option}px
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-[#fff1f0] px-3.5 py-2.5 text-sm text-[#b5473b]">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={downloadQr}
                disabled={!qrImage}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#6d4aff] px-5 text-sm font-semibold text-white shadow-md shadow-[#6d4aff]/20 transition hover:bg-[#5c3de0] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13v3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download QR code
              </button>
              <button
                type="button"
                onClick={copyContent}
                disabled={!value}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e9e7ef] bg-white px-5 text-sm font-semibold text-[#575366] transition hover:border-[#cfc6f5] hover:bg-[#fbfaff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <rect x="7" y="6" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M13 6V4.5A1.5 1.5 0 0 0 11.5 3h-7A1.5 1.5 0 0 0 3 4.5v9A1.5 1.5 0 0 0 4.5 15H7" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {copied ? "Copied!" : "Copy text"}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-[#a09bad]">Your content stays in your browser. Nothing is stored.</p>
          </section>

          <section className="flex flex-col rounded-3xl border border-[#ebe9f1] bg-white p-6 shadow-[0_18px_60px_-36px_rgba(46,36,86,0.25)] sm:p-8">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Live preview</h2>
                <p className="mt-1 text-sm text-[#8b8798]">Scan it to see where it goes</p>
              </div>
              <span className="rounded-lg bg-[#f4f1ff] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#7659eb]">Step 02</span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-[#f9f8fc] px-5 py-8">
              <div className="flex aspect-square w-full max-w-[272px] items-center justify-center rounded-[22px] border border-[#efedf4] bg-white p-5 shadow-[0_12px_32px_-20px_rgba(46,36,86,0.22)]">
                {qrImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrImage} alt="Generated QR code preview" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#b5b1c1]">
                    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
                      <path d="M7 7h13v13H7zM28 7h13v13H28zM7 28h13v13H7z" stroke="currentColor" strokeWidth="3" />
                      <path d="M28 28h6v6h-6zM38 28v4M34 38h7M28 38v3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-medium">{value.trim() ? "Generating your code…" : "Enter content to begin"}</span>
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#898496]">
                <span className="h-2 w-2 rounded-full bg-[#35b888]" />
                High error correction · {size} × {size}px
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#f0eef5] px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f4f1ff] text-[#7659eb]">
                <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
                  <path d="m10 2 1.9 5.8L18 10l-6.1 2.2L10 18l-1.9-5.8L2 10l6.1-2.2L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold text-[#514c60]">Crisp at every size</p>
                <p className="mt-0.5 text-[11px] leading-4 text-[#9691a3]">Your code is ready for screens or print.</p>
              </div>
            </div>
          </section>
        </div>
        <footer className="mt-10 text-center text-xs text-[#a09bad]">Simple, free QR codes. Made for sharing.</footer>
      </section>
    </main>
  );
}

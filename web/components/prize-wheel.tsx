"use client";

import { useMemo, useState } from "react";
import { prizes } from "@/lib/demo-data";

const wheelColors = ["#8d65f7", "#f46bb5", "#43d4c5", "#ffb156", "#668aff", "#d46be7", "#ff758c", "#56c993"];

export function PrizeWheel({ enabled = false, compact = false }: { enabled?: boolean; compact?: boolean }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<(typeof prizes)[number] | null>(null);
  const gradient = useMemo(() => {
    const slice = 360 / prizes.length;
    return `conic-gradient(${prizes.map((_, index) => `${wheelColors[index % wheelColors.length]} ${index * slice}deg ${(index + 1) * slice}deg`).join(",")})`;
  }, []);

  function spin() {
    if (!enabled || spinning) return;
    const index = crypto.getRandomValues(new Uint32Array(1))[0] % prizes.length;
    const slice = 360 / prizes.length;
    const target = 360 - (index + 0.5) * slice;
    setWinner(null);
    setSpinning(true);
    setRotation((current) => current + 360 * 6 + ((target - (current % 360) + 360) % 360));
    window.setTimeout(() => { setSpinning(false); setWinner(prizes[index]); }, 4200);
  }

  return (
    <div className={`wheel-block ${compact ? "compact" : ""}`}>
      <div className={`wheel-shell-next ${enabled ? "ready" : "locked"}`} role="button" tabIndex={enabled ? 0 : -1} aria-disabled={!enabled} onClick={spin} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") spin(); }}>
        <div className="wheel-pointer">✦</div>
        <div className="wheel-disc" style={{ background: gradient, transform: `rotate(${rotation}deg)`, transitionDuration: spinning ? "4.2s" : "0s" }}>
          {prizes.map((prize, index) => {
            const angle = index * (360 / prizes.length) + 360 / prizes.length / 2;
            return <span className="wheel-label" key={prize.id} style={{ transform: `rotate(${angle}deg)` }}><b>{prize.icon} {prize.name}</b></span>;
          })}
        </div>
        <div className="wheel-center-next"><span>✦</span><strong>{enabled ? (spinning ? "..." : "SPIN") : "LOCK"}</strong><small>{enabled ? "KLIK RODA" : "PILIH PESERTA"}</small></div>
      </div>
      {winner && <div className="mini-result"><span>{winner.icon}</span><div><small>HADIAH TERPILIH</small><strong>{winner.name}</strong></div></div>}
    </div>
  );
}

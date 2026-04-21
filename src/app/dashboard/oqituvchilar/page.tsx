"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconButton, PencilIcon } from "@/components/ui/IconButton";
import { oyNomi } from "@/lib/utils";
import Link from "next/link";

type Guruh = {
  id: string;
  nom: string;
  kursNom: string;
  talabaSoni: number;
  darslarSoni: number;
};

type OqituvchiRow = {
  id: string;
  ism: string;
  email: string;
  telefon: string | null;
  mutaxassislik: string[];
  ishHaqiTuri: "FOIZ" | "SOATLIK" | "OYLIK";
  foiz: number | null;
  soatlik: number | null;
  faol: boolean;
  guruhlar: Guruh[];
  oylikDaromad: number;
  hisoblangan: number;
  tolangan: number | null;
  tolanganMi: boolean;
  ishHaqId: string | null;
};

const ISH_HAQI_LABEL: Record<string, string> = {
  FOIZ: "Foiz", SOATLIK: "Soatlik", OYLIK: "Oylik"
};

export default function OqituvchilarPage() {
  const hozir = new Date();
  const [oqituvchilar, setOqituvchilar] = useState<OqituvchiRow[]>([]);
  const [oy, setOy]   = useState(hozir.getMonth() + 1);
  const [yil, setYil] = useState(hozir.getFullYear());
  const [yuklanyapti, setYuklanyapti] = useState(true);

  // Modal holat
  const [modal, setModal]           = useState(false);
  const [tanlangan, setTanlangan]   = useState<OqituvchiRow | null>(null);
  const [summa, setSumma]           = useState("");
  const [izoh, setIzoh]             = useState("");
  const [saqlanyapti, setSaqlanyapti] = useState(false);
  const [xato, setXato]             = useState("");

  // Tahrirlash modal
  const [tahrirModal, setTahrirModal]     = useState(false);
  const [tahrirForm, setTahrirForm]       = useState({
    telefon: "", mutaxassislik: "", ishHaqiTuri: "FOIZ", foiz: "", soatlik: ""
  });
  const [tahrirSaqlanmoqda, setTahrirSaqlanmoqda] = useState(false);

  // Guruh detail
  const [guruhModal, setGuruhModal] = useState(false);
  const [guruhOqituvchi, setGuruhOqituvchi] = useState<OqituvchiRow | null>(null);

  const fetchData = useCallback(async () => {
    setYuklanyapti(true);
    const res = await fetch(`/api/ish-haqi?oy=${oy}&yil=${yil}`);
    const data = await res.json();
    setOqituvchilar(data);
    setYuklanyapti(false);
  }, [oy, yil]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tahrirOch = (o: OqituvchiRow) => {
    setTanlangan(o);
    setTahrirForm({
      telefon:       o.telefon ?? "",
      mutaxassislik: o.mutaxassislik.join(", "),
      ishHaqiTuri:   o.ishHaqiTuri,
      foiz:          o.foiz ? String(o.foiz) : "",
      soatlik:       o.soatlik ? String(o.soatlik) : "",
    });
    setTahrirModal(true);
  };

  const tahrirSaqlash = async () => {
    if (!tanlangan) return;
    setTahrirSaqlanmoqda(true);
    await fetch(`/api/oqituvchilar/${tanlangan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefon:       tahrirForm.telefon || null,
        mutaxassislik: tahrirForm.mutaxassislik
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        ishHaqiTuri: tahrirForm.ishHaqiTuri,
        foiz:        tahrirForm.foiz,
        soatlik:     tahrirForm.soatlik,
      }),
    });
    setTahrirSaqlanmoqda(false);
    setTahrirModal(false);
    fetchData();
  };

  const tolashOch = (o: OqituvchiRow) => {
    setTanlangan(o);
    setSumma(String(o.hisoblangan));
    setIzoh("");
    setXato("");
    setModal(true);
  };

  const tolash = async () => {
    if (!tanlangan) return;
    setSaqlanyapti(true);
    setXato("");

    const res = await fetch("/api/ish-haqi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oqituvchiId: tanlangan.id,
        summa: parseInt(summa),
        oy,
        yil,
        izoh,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setXato(err.error ?? "Xatolik yuz berdi");
      setSaqlanyapti(false);
      return;
    }

    setSaqlanyapti(false);
    setModal(false);
    fetchData();
  };

  const jamiHisoblangan = oqituvchilar.reduce((s, o) => s + o.hisoblangan, 0);
  const jamiTolangan    = oqituvchilar.filter((o) => o.tolanganMi).reduce((s, o) => s + (o.tolangan ?? 0), 0);
  const qolgan          = oqituvchilar.filter((o) => !o.tolanganMi).length;

  return (
    <div>
      <Topbar
        title="O'qituvchilar"
        actions={
          <Link
            href="/dashboard/oqituvchilar/samaradorlik"
            className="px-5 py-2.5 text-sm font-semibold bg-card border-2 border-border rounded-xl hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-soft"
          >
            Samaradorlik hisoboti
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* Oy tanlash */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={oy}
            onChange={(e) => setOy(parseInt(e.target.value))}
            className="px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{oyNomi(i + 1)}</option>
            ))}
          </select>
          <select
            value={yil}
            onChange={(e) => setYil(parseInt(e.target.value))}
            className="px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="px-4 py-2 bg-primary/10 rounded-xl">
            <span className="text-sm font-medium text-primary">{oyNomi(oy)} {yil}</span>
          </div>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Jami hisoblangan"
            value={`${jamiHisoblangan.toLocaleString()} so'm`}
            subColor="gray"
          />
          <StatCard
            label="To'langan"
            value={`${jamiTolangan.toLocaleString()} so'm`}
            subColor="green"
          />
          <StatCard
            label="To'lanmagan"
            value={`${qolgan} o'qituvchi`}
            subColor="gray"
          />
        </div>

        {/* Jadval */}
        <Card>
          <CardHeader>
            <CardTitle>
              O'qituvchilar ro'yxati
              <span className="ml-2 text-gray-400 font-normal">({oqituvchilar.length} ta)</span>
            </CardTitle>
          </CardHeader>

          {yuklanyapti ? (
            <div className="py-16 text-center text-sm text-gray-400">Yuklanmoqda...</div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>O'qituvchi</Th>
                  <Th>Mutaxassislik</Th>
                  <Th>Guruhlar</Th>
                  <Th>Ish haqi turi</Th>
                  <Th>Oylik daromad</Th>
                  <Th>Hisoblangan</Th>
                  <Th>Holat</Th>
                  <Th></Th>
                </tr>
              </Thead>
              <Tbody>
                {oqituvchilar.map((o) => (
                  <Tr key={o.id}>
                    <Td>
                      <div>
                        <p className="font-medium text-foreground">{o.ism}</p>
                        <p className="text-sm text-muted-foreground">{o.email}</p>
                        {o.telefon && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{o.telefon}</p>
                        )}
                      </div>
                    </Td>

                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {o.mutaxassislik.length > 0
                          ? o.mutaxassislik.map((m, i) => (
                              <Badge key={i} variant="blue">{m}</Badge>
                            ))
                          : <span className="text-gray-400 text-xs">—</span>
                        }
                      </div>
                    </Td>

                    <Td>
                      {o.guruhlar.length > 0 ? (
                        <button
                          onClick={() => { setGuruhOqituvchi(o); setGuruhModal(true); }}
                          className="text-primary text-sm font-medium hover:text-primary/80 hover:underline transition-colors"
                        >
                          {o.guruhlar.length} ta guruh
                        </button>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">Guruh yo'q</span>
                      )}
                    </Td>

                    <Td>
                      <div className="text-sm">
                        <Badge variant="purple">{ISH_HAQI_LABEL[o.ishHaqiTuri]}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {o.ishHaqiTuri === "FOIZ" && o.foiz
                            ? `${o.foiz}%`
                            : o.ishHaqiTuri === "SOATLIK" && o.soatlik
                            ? `${o.soatlik.toLocaleString()} so'm/soat`
                            : o.soatlik
                            ? `${o.soatlik.toLocaleString()} so'm/oy`
                            : "—"}
                        </p>
                      </div>
                    </Td>

                    <Td className="font-medium text-foreground">
                      {o.oylikDaromad.toLocaleString()} so'm
                    </Td>

                    <Td className="font-bold text-foreground">
                      {o.hisoblangan.toLocaleString()} so'm
                    </Td>

                    <Td>
                      {o.tolanganMi ? (
                        <div>
                          <Badge variant="green">To'langan</Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {o.tolangan?.toLocaleString()} so'm
                          </p>
                        </div>
                      ) : (
                        <Badge variant="amber">Kutilmoqda</Badge>
                      )}
                    </Td>

                    <Td>
                      <div className="flex items-center gap-2">
                        <IconButton title="Tahrirlash" onClick={() => tahrirOch(o)}>
                          <PencilIcon />
                        </IconButton>
                        {!o.tolanganMi && (
                          <Button variant="primary" size="sm" onClick={() => tolashOch(o)}>
                            To'lash
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}

                {oqituvchilar.length === 0 && (
                  <Tr>
                    <Td colSpan={8} className="text-center text-gray-400 py-10">
                      O'qituvchi topilmadi
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Ish haqi to'lash modali */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Ish haqi to'lash"
      >
        {tanlangan && (
          <div className="space-y-4">
            {/* O'qituvchi ma'lumoti */}
            <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-2">
              <p className="font-semibold text-foreground">{tanlangan.ism}</p>
              <p className="text-sm text-muted-foreground">{oyNomi(oy)} {yil} oy uchun</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span>Guruhlar: <span className="font-semibold text-foreground">{tanlangan.guruhlar.length} ta</span></span>
                <span>Daromad: <span className="font-semibold text-foreground">{tanlangan.oylikDaromad.toLocaleString()} so'm</span></span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-medium">
                  {tanlangan.ishHaqiTuri === "FOIZ"
                    ? `${tanlangan.foiz}%`
                    : tanlangan.ishHaqiTuri === "SOATLIK"
                    ? `Soatlik`
                    : `Oylik`}
                </span>
              </div>
            </div>

            <Input
              label="To'lov summasi (so'm) *"
              type="number"
              value={summa}
              onChange={(e) => setSumma(e.target.value)}
              placeholder={String(tanlangan.hisoblangan)}
            />

            <Input
              label="Izoh"
              value={izoh}
              onChange={(e) => setIzoh(e.target.value)}
              placeholder="Ixtiyoriy..."
            />

            {xato && (
              <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-sm text-destructive font-medium">{xato}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
              <Button
                variant="primary"
                onClick={tolash}
                disabled={!summa || parseInt(summa) <= 0 || saqlanyapti}
              >
                {saqlanyapti ? "Saqlanmoqda..." : "To'lash"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tahrirlash modali */}
      <Modal
        open={tahrirModal}
        onClose={() => setTahrirModal(false)}
        title={`${tanlangan?.ism} — tahrirlash`}
      >
        <div className="space-y-4">
          <Input
            label="Telefon"
            placeholder="+998 90 123 45 67"
            value={tahrirForm.telefon}
            onChange={(e) => setTahrirForm({ ...tahrirForm, telefon: e.target.value })}
          />
          <Input
            label="Mutaxassislik (vergul bilan)"
            placeholder="Ingliz tili, Matematika"
            value={tahrirForm.mutaxassislik}
            onChange={(e) => setTahrirForm({ ...tahrirForm, mutaxassislik: e.target.value })}
          />
          <Select
            label="Ish haqi turi"
            value={tahrirForm.ishHaqiTuri}
            onChange={(e) => setTahrirForm({ ...tahrirForm, ishHaqiTuri: e.target.value })}
          >
            <option value="FOIZ">Foiz (guruh daromadidan %)</option>
            <option value="SOATLIK">Soatlik (dars boshiga)</option>
            <option value="OYLIK">Oylik (belgilangan summa)</option>
          </Select>
          {tahrirForm.ishHaqiTuri === "FOIZ" ? (
            <Input
              label="Foiz (%)"
              type="number"
              placeholder="20"
              value={tahrirForm.foiz}
              onChange={(e) => setTahrirForm({ ...tahrirForm, foiz: e.target.value })}
            />
          ) : (
            <Input
              label={tahrirForm.ishHaqiTuri === "SOATLIK" ? "Soatlik narx (so'm)" : "Oylik summa (so'm)"}
              type="number"
              placeholder={tahrirForm.ishHaqiTuri === "SOATLIK" ? "25000" : "1500000"}
              value={tahrirForm.soatlik}
              onChange={(e) => setTahrirForm({ ...tahrirForm, soatlik: e.target.value })}
            />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setTahrirModal(false)}>Bekor</Button>
            <Button variant="primary" onClick={tahrirSaqlash} disabled={tahrirSaqlanmoqda}>
              {tahrirSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Guruhlar detail modali */}
      <Modal
        open={guruhModal}
        onClose={() => setGuruhModal(false)}
        title={`${guruhOqituvchi?.ism} — guruhlar`}
      >
        {guruhOqituvchi && (
          <div className="space-y-2">
            {guruhOqituvchi.guruhlar.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/20 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">{g.nom}</p>
                  <p className="text-sm text-muted-foreground">{g.kursNom}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{g.talabaSoni} talaba</p>
                  <p className="text-sm text-muted-foreground">{g.darslarSoni} dars ({oyNomi(oy)})</p>
                </div>
              </div>
            ))}
            {guruhOqituvchi.guruhlar.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <p className="text-muted-foreground">Guruh yo'q</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

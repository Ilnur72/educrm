"use client";
import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { IconButton, PencilIcon, TrashIcon } from "@/components/ui/IconButton";

type Xona = {
  id: string;
  nom: string;
  sigim: number | null;
  izoh: string | null;
  faol: boolean;
};

const emptyForm = { nom: "", sigim: "", izoh: "" };

export default function XonalarPage() {
  const [xonalar, setXonalar]         = useState<Xona[]>([]);
  const [modal, setModal]             = useState(false);
  const [tahrir, setTahrir]           = useState<Xona | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [saqlanyapti, setSaqlanyapti] = useState(false);

  const fetchXonalar = useCallback(async () => {
    const res = await fetch("/api/xonalar");
    const data = await res.json();
    setXonalar(data);
  }, []);

  useEffect(() => { fetchXonalar(); }, [fetchXonalar]);

  const ochModal = (xona?: Xona) => {
    if (xona) {
      setTahrir(xona);
      setForm({ nom: xona.nom, sigim: xona.sigim ? String(xona.sigim) : "", izoh: xona.izoh ?? "" });
    } else {
      setTahrir(null);
      setForm(emptyForm);
    }
    setModal(true);
  };

  const saqlash = async () => {
    if (!form.nom) return;
    setSaqlanyapti(true);

    const payload = { nom: form.nom, sigim: form.sigim || null, izoh: form.izoh || null };

    if (tahrir) {
      await fetch(`/api/xonalar/${tahrir.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/xonalar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaqlanyapti(false);
    setModal(false);
    fetchXonalar();
  };

  const ochirish = async (id: string) => {
    if (!confirm("Xonani o'chirish?")) return;
    await fetch(`/api/xonalar/${id}`, { method: "DELETE" });
    fetchXonalar();
  };

  const faolToggle = async (xona: Xona) => {
    await fetch(`/api/xonalar/${xona.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...xona, faol: !xona.faol }),
    });
    fetchXonalar();
  };

  return (
    <div>
      <Topbar
        title="Xonalar"
        actions={
          <Button variant="primary" onClick={() => ochModal()}>
            + Yangi xona
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Xonalar ro'yxati
              <span className="ml-2 text-gray-400 font-normal">({xonalar.length} ta)</span>
            </CardTitle>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Xona nomi</Th>
                <Th>Sig'im</Th>
                <Th>Izoh</Th>
                <Th>Holat</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {xonalar.map((x) => (
                <Tr key={x.id}>
                  <Td className="font-medium">{x.nom}</Td>
                  <Td>{x.sigim ? `${x.sigim} kishi` : "—"}</Td>
                  <Td className="text-gray-400">{x.izoh ?? "—"}</Td>
                  <Td>
                    <button onClick={() => faolToggle(x)}>
                      <Badge variant={x.faol ? "green" : "gray"}>
                        {x.faol ? "Faol" : "Nofaol"}
                      </Badge>
                    </button>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <IconButton title="Tahrirlash" onClick={() => ochModal(x)}>
                        <PencilIcon />
                      </IconButton>
                      <IconButton title="O'chirish" onClick={() => ochirish(x.id)} variant="danger">
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
              {xonalar.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center text-gray-400 py-10">
                    Xona qo'shilmagan
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={tahrir ? "Xonani tahrirlash" : "Yangi xona"}
      >
        <div className="space-y-4">
          <Input
            label="Xona nomi *"
            placeholder="201-xona"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <Input
            label="Sig'im (kishi soni)"
            type="number"
            placeholder="20"
            value={form.sigim}
            onChange={(e) => setForm({ ...form, sigim: e.target.value })}
          />
          <Input
            label="Izoh"
            placeholder="Ixtiyoriy..."
            value={form.izoh}
            onChange={(e) => setForm({ ...form, izoh: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.nom || saqlanyapti}
            >
              {saqlanyapti ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

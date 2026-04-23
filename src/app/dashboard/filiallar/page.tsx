"use client";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { IconButton, PencilIcon, TrashIcon } from "@/components/ui/IconButton";

type Filial = {
  id: string;
  nom: string;
  manzil: string | null;
  telefon: string | null;
  faol: boolean;
  createdAt: string;
  _count: { talabalar: number; guruhlar: number; userlar: number };
};

const emptyForm = { nom: "", manzil: "", telefon: "" };

export default function FiliallarPage() {
  const [filiallar, setFiliallar] = useState<Filial[]>([]);
  const [modal, setModal] = useState(false);
  const [editFilial, setEditFilial] = useState<Filial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const fetch_ = () =>
    fetch("/api/filiallar")
      .then((r) => r.json())
      .then(setFiliallar)
      .catch(() => {});

  useEffect(() => { fetch_(); }, []);

  const ochModal = (filial?: Filial) => {
    setEditFilial(filial ?? null);
    setForm(filial ? { nom: filial.nom, manzil: filial.manzil ?? "", telefon: filial.telefon ?? "" } : emptyForm);
    setModal(true);
  };

  const saqlash = async () => {
    setSaqlanmoqda(true);
    if (editFilial) {
      await fetch(`/api/filiallar/${editFilial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/filiallar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaqlanmoqda(false);
    setModal(false);
    fetch_();
  };

  const ochirish = async (id: string) => {
    if (!confirm("Filialni o'chirasizmi? (Ma'lumotlar saqlanadi)")) return;
    await fetch(`/api/filiallar/${id}`, { method: "DELETE" });
    fetch_();
  };

  return (
    <div>
      <Topbar
        title="Filiallar"
        actions={
          <Button variant="primary" onClick={() => ochModal()}>+ Yangi filial</Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Barcha filiallar
              <span className="ml-2 text-gray-400 font-normal">({filiallar.length})</span>
            </CardTitle>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Filial nomi</Th>
                <Th>Manzil</Th>
                <Th>Telefon</Th>
                <Th>Talabalar</Th>
                <Th>Guruhlar</Th>
                <Th>Xodimlar</Th>
                <Th>Holat</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {filiallar.map((f) => (
                <Tr key={f.id}>
                  <Td className="font-medium text-gray-900">{f.nom}</Td>
                  <Td className="text-gray-500">{f.manzil ?? "—"}</Td>
                  <Td className="font-mono text-xs">{f.telefon ?? "—"}</Td>
                  <Td className="font-semibold">{f._count.talabalar}</Td>
                  <Td>{f._count.guruhlar}</Td>
                  <Td>{f._count.userlar}</Td>
                  <Td>
                    <Badge variant={f.faol ? "green" : "red"}>
                      {f.faol ? "Faol" : "Yopilgan"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <IconButton title="Tahrirlash" onClick={() => ochModal(f)}>
                        <PencilIcon />
                      </IconButton>
                      <IconButton title="O'chirish" variant="danger" onClick={() => ochirish(f.id)}>
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filiallar.length === 0 && (
                <Tr>
                  <Td colSpan={8} className="text-center text-gray-400 py-10">
                    Hali filial yo'q
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
        title={editFilial ? "Filialni tahrirlash" : "Yangi filial"}
      >
        <div className="space-y-4">
          <Input
            label="Filial nomi *"
            placeholder="Chilonzor filiali"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <Input
            label="Manzil"
            placeholder="Toshkent, Chilonzor tumani..."
            value={form.manzil}
            onChange={(e) => setForm({ ...form, manzil: e.target.value })}
          />
          <Input
            label="Telefon"
            placeholder="+998 90 000 00 00"
            value={form.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Bekor</Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.nom || saqlanmoqda}
            >
              {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

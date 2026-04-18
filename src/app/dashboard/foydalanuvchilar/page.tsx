"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type UserRow = {
  id: string; name: string; email: string; role: string; createdAt: string;
};

const ROLE_CONFIG: Record<string, { label: string; variant: "purple" | "teal" | "blue" }> = {
  ADMIN:     { label: "Administrator", variant: "purple" },
  OQITUVCHI: { label: "O'qituvchi",   variant: "teal"   },
  RECEPTION: { label: "Resepshn",      variant: "blue"   },
};

export default function FoydalanuvchilarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "RECEPTION" });
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato]       = useState("");

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [session, router]);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/foydalanuvchilar");
    const data = await res.json();
    setUsers(data);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const saqlash = async () => {
    if (!form.name || !form.email || !form.password) return;
    setSaqlanmoqda(true);
    setXato("");

    const res = await fetch("/api/foydalanuvchilar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setXato(data.error ?? "Xatolik yuz berdi");
    } else {
      setModal(false);
      setForm({ name: "", email: "", password: "", role: "RECEPTION" });
      fetchUsers();
    }
    setSaqlanmoqda(false);
  };

  const ochirish = async (id: string) => {
    if (id === session?.user?.id) { alert("O'z akkauntingizni o'chira olmaysiz"); return; }
    if (!confirm("Foydalanuvchini o'chirish?")) return;
    await fetch(`/api/foydalanuvchilar/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div>
      <Topbar
        title="Foydalanuvchilar"
        actions={
          <Button variant="primary" onClick={() => setModal(true)}>
            + Yangi foydalanuvchi
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tizim foydalanuvchilari <span className="text-gray-400 font-normal">({users.length})</span></CardTitle>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Ism</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Qo'shilgan</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {users.map((u) => {
                const rc = ROLE_CONFIG[u.role];
                const isMe = u.id === session?.user?.id;
                return (
                  <Tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name}</span>
                        {isMe && <span className="text-xs text-gray-400">(siz)</span>}
                      </div>
                    </Td>
                    <Td className="text-gray-500">{u.email}</Td>
                    <Td><Badge variant={rc.variant}>{rc.label}</Badge></Td>
                    <Td className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
                    </Td>
                    <Td>
                      {!isMe && (
                        <button
                          onClick={() => ochirish(u.id)}
                          className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Card>
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setXato(""); }} title="Yangi foydalanuvchi">
        <div className="space-y-4">
          <Input label="To'liq ism *" placeholder="Kamola Mirzayeva"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email *" type="email" placeholder="kamola@educrm.uz"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Parol *" type="password" placeholder="Kamida 8 belgi"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Rol" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.entries(ROLE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>

          {/* Rol izohlar */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
            <p><span className="font-medium text-purple-700">Administrator</span> — hamma narsaga kirish</p>
            <p><span className="font-medium text-teal-700">O'qituvchi</span> — faqat davomat belgilash</p>
            <p><span className="font-medium text-blue-700">Resepshn</span> — lidlar, talabalar, to'lovlar</p>
          </div>

          {xato && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
              {xato}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setModal(false); setXato(""); }}>Bekor</Button>
            <Button
              variant="primary"
              onClick={saqlash}
              disabled={!form.name || !form.email || !form.password || saqlanmoqda}
            >
              {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


import React from "react";
import { Contact, Megaphone } from "lucide-react";
import { SectionCard } from "./SectionCard";

interface ContactFormProps {
    settings: any;
    updateField: (path: string, value: any) => void;
}

export const ContactForm = ({ settings, updateField }: ContactFormProps) => {
    return (
        <div className="space-y-6">
            <SectionCard
                title="Kontak & Info Lokasi"
                description="Informasi kontak yang ditampilkan di footer dan bagian kontak."
                icon={Contact}
                iconColor="text-emerald-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Alamat Lengkap</label>
                        <input
                            type="text"
                            value={settings.contact.address}
                            onChange={(e) => updateField("contact.address", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Nomor Telepon/WA</label>
                            <input
                                type="text"
                                value={settings.contact.phone}
                                onChange={(e) => updateField("contact.phone", e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Email</label>
                            <input
                                type="email"
                                value={settings.contact.email}
                                onChange={(e) => updateField("contact.email", e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Google Maps URL (Embed)</label>
                        <input
                            type="text"
                            value={settings.contact.googleMapsUrl || ""}
                            onChange={(e) => updateField("contact.googleMapsUrl", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-mono text-slate-500"
                            placeholder="https://www.google.com/maps/embed?..."
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                title="Call to Action (Bawah)"
                description="Ajakan bertindak di bagian bawah halaman."
                icon={Megaphone}
                iconColor="text-blue-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Ajakan</label>
                        <input
                            type="text"
                            value={settings.cta.title}
                            onChange={(e) => updateField("cta.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Tombol Utama</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings.cta.primaryButton.text}
                                    onChange={(e) => updateField("cta.primaryButton.text", e.target.value)}
                                    placeholder="Teks"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                />
                                <input
                                    type="text"
                                    value={settings.cta.primaryButton.link}
                                    onChange={(e) => updateField("cta.primaryButton.link", e.target.value)}
                                    placeholder="Link"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Tombol Kedua</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings.cta.secondaryButton.text}
                                    onChange={(e) => updateField("cta.secondaryButton.text", e.target.value)}
                                    placeholder="Teks"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                />
                                <input
                                    type="text"
                                    value={settings.cta.secondaryButton.link}
                                    onChange={(e) => updateField("cta.secondaryButton.link", e.target.value)}
                                    placeholder="Link"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                title="Footer"
                description="Pengaturan konten footer situs."
                icon={Megaphone}
                iconColor="text-slate-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Deskripsi Footer</label>
                        <textarea
                            value={settings.footer?.description || ""}
                            onChange={(e) => updateField("footer.description", e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Hak Cipta (Copyright)</label>
                        <input
                            type="text"
                            value={settings.footer?.copyright || ""}
                            onChange={(e) => updateField("footer.copyright", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </SectionCard>
        </div >
    );
};

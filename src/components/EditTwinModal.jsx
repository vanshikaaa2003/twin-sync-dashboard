import { useState } from "react";
import { updateTwin } from "../api/twins";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function EditTwinModal({ twin, setTwins }) {
  const [open, setOpen] = useState(false);
  const [specURL, setSpecURL] = useState(twin.specURL);
  const [caps, setCaps] = useState(twin.capabilities.join(", "));

  const save = async () => {
    const capabilities = caps.split(",").map((c) => c.trim());
    const updated = await updateTwin(twin.id, { specURL, capabilities });
    setTwins((twins) =>
      twins.map((t) => (t.id === twin.id ? updated : t))
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Pencil size={16} /></Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-bold mb-4">Edit Twin</h2>
        <input className="w-full border mb-2 p-2" value={specURL} onChange={(e) => setSpecURL(e.target.value)} />
        <input className="w-full border p-2" value={caps} onChange={(e) => setCaps(e.target.value)} />
        <Button onClick={save} className="mt-2">Save</Button>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Bot, Phone, Search, Trash2, User } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../lib/api";

type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  message?: string;
  type?: string;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
};

export default function Enquiries() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/enquiry`, { withCredentials: true });
      setItems(res.data.data || []);
      setError("");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${API_BASE}/api/enquiry/${id}`, { status }, { withCredentials: true });
      setItems((prev) => prev.map((e) => (e._id === id ? { ...e, status: status as Enquiry["status"] } : e)));
    } catch {
      alert("Failed to update status");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await axios.delete(`${API_BASE}/api/enquiry/${id}`, { withCredentials: true });
      setItems((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const filtered = items.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search) ||
      (e.message || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading AI trip planner enquiries…</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="w-7 h-7 text-lux-accent" /> AI Trip Planner leads
        </h1>
        <p className="text-gray-500 mt-1">Contacts shared from the website trip planner chat</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No enquiries yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((e) => (
              <div key={e._id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4" /> {e.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> {e.phone}
                    </p>
                    {e.message && <p className="text-sm text-gray-700 mt-3 bg-gray-50 p-3 rounded-lg">{e.message}</p>}
                    <p className="text-xs text-gray-400 mt-2">{new Date(e.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-start">
                    <select
                      value={e.status}
                      onChange={(ev) => updateStatus(e._id, ev.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(e._id)}
                      className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

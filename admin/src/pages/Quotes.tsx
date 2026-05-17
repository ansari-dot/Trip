import { useState, useEffect } from "react";
import { MessageSquare, Mail, Phone, Calendar, MapPin, Users, CheckCircle, Clock, Trash2, XCircle, Search } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../lib/api";

type QuoteRequest = {
  _id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  destination: string;
  travelDates: string;
  numberOfDays?: number;
  travelers: number;
  serviceType?: string;
  serviceDetails?: Record<string, string>;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
};

export default function Quotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/quotes`, {
        withCredentials: true,
      });
      setQuotes(response.data.data || []);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load quote requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `${API_BASE}/api/quotes/${id}`,
        { status },
        { withCredentials: true }
      );
      setQuotes((prev) =>
        prev.map((quote) => (quote._id === id ? { ...quote, status: status as any } : quote))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteQuote = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this quote request?")) return;

    try {
      await axios.delete(`${API_BASE}/api/quotes/${id}`, {
        withCredentials: true,
      });
      setQuotes((prev) => prev.filter((quote) => quote._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete quote");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Contacted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch = 
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.destination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.serviceType || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="p-8">Loading quotes...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
          <p className="text-gray-500 mt-1">Manage customer inquiries and quote requests</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No quote requests found matching your filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => (
              <div key={quote._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{quote.name}</h3>
                          {quote.serviceType && (
                            <span className="px-2 py-0.5 bg-lux-accent/10 text-lux-accent text-[10px] font-bold uppercase tracking-wider rounded border border-lux-accent/20">
                              {quote.serviceType}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {quote.email}</span>
                          <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {quote.whatsappNumber}</span>
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-4 h-4" /> {new Date(quote.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destination</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" /> {quote.destination || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Travel Dates</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" /> {quote.travelDates || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Days</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" /> {quote.numberOfDays || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Travelers</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" /> {quote.travelers || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {quote.serviceDetails && Object.keys(quote.serviceDetails).length > 0 && (
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Service Specific Details</p>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(quote.serviceDetails).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm font-semibold text-gray-700">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {quote.message && (
                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-800 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <span>{quote.message}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 lg:border-l lg:pl-6 border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-2 hidden lg:block">Actions</div>
                    {quote.status !== "Contacted" && (
                      <button
                        onClick={() => updateStatus(quote._id, "Contacted")}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark Contacted
                      </button>
                    )}
                    {quote.status !== "Closed" && (
                      <button
                        onClick={() => updateStatus(quote._id, "Closed")}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                      >
                        <XCircle className="w-4 h-4" /> Close Request
                      </button>
                    )}
                    <button
                      onClick={() => deleteQuote(quote._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-100 mt-auto"
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

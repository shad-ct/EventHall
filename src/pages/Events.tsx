import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event, EventCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Filter } from "lucide-react";
import EventCard from "@/components/EventCard";
import { toast } from "sonner";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"date" | "district">("date");

  const categories: Array<EventCategory | "all"> = [
    "all",
    "seminar",
    "fest",
    "workshop",
    "competition",
    "cultural",
    "sports",
    "other",
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, "events"),
        where("status", "==", "published")
      );

      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      });

      // Default sort by date in descending order client-side
      eventsData.sort((a, b) => b.date.getTime() - a.date.getTime());

      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error loading events. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Apply category, district and search filters
  const filteredEvents = events
    .filter((event) => {
      if (selectedCategory !== "all" && event.category !== selectedCategory)
        return false;
      if (selectedDistrict !== "all" && event.district !== selectedDistrict)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = event.title.toLowerCase().includes(q);
        const inCategories = (event.categories || []).some((c) =>
          c.toLowerCase().includes(q)
        );
        const inPrimary = event.category.toLowerCase().includes(q);
        if (!inTitle && !inCategories && !inPrimary) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") return b.date.getTime() - a.date.getTime();
      // sortBy district: alphabetical by district then by date desc
      const da = (a.district || "").toLowerCase();
      const db = (b.district || "").toLowerCase();
      if (da < db) return -1;
      if (da > db) return 1;
      return b.date.getTime() - a.date.getTime();
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Campus Events</h1>
          <p className="text-muted-foreground">
            Discover and register for upcoming events
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Filters</span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
              <Input
                placeholder="Search by title, category or custom category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />

              <Select
                value={selectedDistrict}
                onValueChange={(v) => setSelectedDistrict(v as string | "all")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="Thiruvananthapuram">
                    Thiruvananthapuram
                  </SelectItem>
                  <SelectItem value="Kollam">Kollam</SelectItem>
                  <SelectItem value="Pathanamthitta">Pathanamthitta</SelectItem>
                  <SelectItem value="Alappuzha">Alappuzha</SelectItem>
                  <SelectItem value="Kottayam">Kottayam</SelectItem>
                  <SelectItem value="Idukki">Idukki</SelectItem>
                  <SelectItem value="Ernakulam">Ernakulam</SelectItem>
                  <SelectItem value="Thrissur">Thrissur</SelectItem>
                  <SelectItem value="Palakkad">Palakkad</SelectItem>
                  <SelectItem value="Malappuram">Malappuram</SelectItem>
                  <SelectItem value="Kozhikode">Kozhikode</SelectItem>
                  <SelectItem value="Wayanad">Wayanad</SelectItem>
                  <SelectItem value="Kannur">Kannur</SelectItem>
                  <SelectItem value="Kasaragod">Kasaragod</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={sortBy === "date" ? "default" : "outline"}
                  onClick={() => setSortBy("date")}
                >
                  Sort: Date
                </Button>
                <Button
                  variant={sortBy === "district" ? "default" : "outline"}
                  onClick={() => setSortBy("district")}
                >
                  Sort: District
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? "Check back later for upcoming events"
                  : `No ${selectedCategory} events available right now`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onUpdate={fetchEvents} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;

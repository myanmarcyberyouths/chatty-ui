import { useState , useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";

const mockUsers = [
  { id: "1", name: "Saw", role: "Admin", lastSeen: new Date(), isActive: true },
  {
    id: "2",
    name: "Andrew",
    role: "Student",
    lastSeen: new Date(),
    isActive: true,
  },
  {
    id: "3",
    name: "Lin",
    role: "Student",
    lastSeen: new Date(),
    isActive: false,
  },
  {
    id: "4",
    name: "Aung",
    role: "Admin",
    lastSeen: new Date(),
    isActive: false,
  },
  {
    id: "5",
    name: "Khant",
    role: "Student",
    lastSeen: new Date(),
    isActive: true,
  },
];

function Home() {
  const [users , setUsers] = useState([])
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("");
  const {logout} = useAuth()
  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/auth'

  useEffect(() => {
    axios.get(`${API_BASE_URL}/active-users`)
      .then((res) => {
        setUsers(res.data)
      })
      .catch((error) => console.log(error))
  }, [])

  const recentUsers = filteredUsers.filter((user) => user.isActive);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chat List</h1>
        <Button variant="ghost" className="p-2" onClick={handleLogout}>
            <LogOutIcon className="scale-125" />
        </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Recent</h2>
          {recentUsers.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}

          <h2 className="text-xl font-bold text-blue-600 mt-6 mb-4">All</h2>
          {users.map((user) => (
            <UserItem 
                key={user._id} 
                user={user} 
                onClick={() => navigate(`/chat/${user._id}`)} 
            />

          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function UserItem({ user, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
      <div className="relative">
        <Avatar>
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
        {user.isActive && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm text-muted-foreground">User</p>
      </div>
      <span className="text-sm text-muted-foreground">8:00 pm</span>
    </div>
  );
}

export default Home;

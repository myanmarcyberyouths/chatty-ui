import { useState , useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";

function Home() {
  const [users , setUsers] = useState([])
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("");
  const {logout} = useAuth()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/auth'
  const authUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get(`${API_BASE_URL}/active-users`)
      .then((res) => {
        const users = res.data.filter((item) => item._id !== authUser._id)
        setUsers(users)
      })
      .catch((error) => console.log(error))
  }, [])

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
      <div className="flex-1">
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm text-muted-foreground">User</p>
      </div>
      <span className="text-sm text-muted-foreground">8:00 pm</span>
    </div>
  );
}

export default Home;

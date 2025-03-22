import { useState, useEffect } from "react";
import { Search, LogOutIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";
import UserItem from "@/components/UserItem";
import GroupItem from "@/components/GroupItem";
import CreateGroupModal from "@/components/CreateGroupModal";

function Home() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/auth";
  const authUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios.get(`${API_BASE_URL}/active-users`)
      .then((res) => {
        const filteredUsers = res.data.filter((item) => item._id !== authUser._id);
        setUsers(filteredUsers);
      })
      .catch((error) => console.log(error));

    axios.get(`${API_BASE_URL}/groups/${authUser._id}`)
      .then((res) => {
        if (res.data.success) {
          setGroups(res.data.data); // Set groups the user is part of
        } else {
          console.error("Failed to fetch groups:", res.data.message);
        };
      })
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="p-4">
        <Button
          className="w-full flex items-center gap-2"
          onClick={() => setShowCreateGroupModal(true)}
        >
          Create Group
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Groups</h2>
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <GroupItem
                key={group._id}
                group={group}
                onClick={() => navigate(`/group-chat/${group._id}`)}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">No groups found</p>
          )}

          <h2 className="text-xl font-bold text-blue-600 mt-6 mb-4">All Users</h2>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                onClick={() => navigate(`/chat/${user._id}`)}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">No users found</p>
          )}
        </div>
      </ScrollArea>

      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onCreate={(group) => {
            setGroups([...groups, group]);
            setShowCreateGroupModal(false);
          }}
          users={users}
        />
      )}
    </div>
  );
}

export default Home;

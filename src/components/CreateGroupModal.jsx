import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router";

export default function CreateGroupModal({ onClose, onCreate, users }) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/auth";
  const authUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/create`, {
        name: groupName,
        admin: authUser._id,
        members: selectedMembers,
      });

      console.log("Group created:", response.data);

      onCreate(response.data);

      navigate(`/group-chat/${response.data._id}`); 
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Group</h2>
        <Input
          className="mb-4"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <h3 className="font-semibold mb-2">Add Members</h3>
        <div className="max-h-40 overflow-y-auto mb-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              onClick={() => {
                if (selectedMembers.includes(user._id)) {
                  setSelectedMembers(selectedMembers.filter((id) => id !== user._id));
                } else {
                  setSelectedMembers([...selectedMembers, user._id]);
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedMembers.includes(user._id)}
                readOnly
              />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup}>Create</Button>
        </div>
      </div>
    </div>
  );
}

export default function UserItem({ user, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
    >
      <div className="flex-1">
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm text-muted-foreground">User</p>
      </div>
    </div>
  );
}

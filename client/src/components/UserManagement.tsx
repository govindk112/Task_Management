"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTaskStore } from "@/store/taskStore"
import { useProjectStore } from "@/store/useProjectStore"

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Member'
  status: 'Active' | 'Inactive'
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', status: 'Inactive' },
]

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const { tasks = [] } = useTaskStore()
  const { projects = [] } = useProjectStore()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    }
    setUsers([...users, newUser])
  }

  const handleEditUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ))
  }

  const handleDeactivateUser = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: 'Inactive' } : user
    ))
  }

  const handleAssignRole = (userId: string, newRole: User['role']) => {
    handleEditUser(userId, { role: newRole })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and assign their role.
              </DialogDescription>
            </DialogHeader>
            <AddUserForm onAdd={handleAddUser} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                // Find tasks assigned to this user
                const assignedTasks = tasks.filter(t =>
                  t.assignedUsers?.some(u => u.id === user.id)
                )
                // Find unique projects for this user
                const assignedProjectIds = [
                  ...new Set(assignedTasks.map(t => t.projectId).filter(Boolean))
                ]
                const assignedProjects = projects.filter(p =>
                  assignedProjectIds.includes(p.id)
                )

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Manager' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditModalOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id)}
                          disabled={user.status === 'Inactive'}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role
              </DialogDescription>
            </DialogHeader>
            <EditUserForm 
              user={selectedUser} 
              onSave={(updates) => {
                handleEditUser(selectedUser.id, updates)
                setIsEditModalOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AddUserForm({ onAdd }: { onAdd: (userData: Omit<User, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member' as User['role'],
    status: 'Active' as User['status']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Add User</Button>
    </form>
  )
}

function EditUserForm({ user, onSave }: { user: User, onSave: (updates: Partial<User>) => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  )
}

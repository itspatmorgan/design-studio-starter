import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/systems/product/components/tabs';

export const Basic = () => (
  <Tabs defaultValue="account" className="w-xs">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account"><p className="text-sm">Update your account details.</p></TabsContent>
    <TabsContent value="password"><p className="text-sm">Change your password.</p></TabsContent>
  </Tabs>
);

export const Line = () => (
  <Tabs defaultValue="overview" className="w-xs">
    <TabsList variant="line">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
    </TabsList>
    <TabsContent value="overview"><p className="text-sm">A summary of the item.</p></TabsContent>
    <TabsContent value="activity"><p className="text-sm">Recent changes.</p></TabsContent>
  </Tabs>
);

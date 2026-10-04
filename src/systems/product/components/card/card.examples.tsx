import { Button } from '@/systems/product/components/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/systems/product/components/card';

export const Basic = () => (
  <Card className="w-xs">
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Choose what you hear about.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm">You have 3 unread messages.</p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Mark as read</Button>
    </CardFooter>
  </Card>
);

export const WithAction = () => (
  <Card className="w-xs">
    <CardHeader>
      <CardTitle>Team</CardTitle>
      <CardDescription>Members with access.</CardDescription>
      <CardAction>
        <Button size="sm" variant="outline">Invite</Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p className="text-sm">4 members</p>
    </CardContent>
  </Card>
);

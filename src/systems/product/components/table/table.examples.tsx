import { Badge } from '@/systems/product/components/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/systems/product/components/table';

export const Basic = () => (
  <Table className="w-sm">
    <TableCaption>Recent invoices</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>INV-001</TableCell>
        <TableCell><Badge variant="secondary">Paid</Badge></TableCell>
        <TableCell className="text-right">$250.00</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>INV-002</TableCell>
        <TableCell><Badge variant="outline">Pending</Badge></TableCell>
        <TableCell className="text-right">$150.00</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>INV-003</TableCell>
        <TableCell><Badge variant="destructive">Overdue</Badge></TableCell>
        <TableCell className="text-right">$350.00</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

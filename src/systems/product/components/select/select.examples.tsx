import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/systems/product/components/select';

export const Basic = () => (
  <Select>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Pick a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="cherry">Cherry</SelectItem>
    </SelectContent>
  </Select>
);

export const WithGroups = () => (
  <Select>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Pick a food" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Vegetables</SelectLabel>
        <SelectItem value="carrot">Carrot</SelectItem>
        <SelectItem value="leek">Leek</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

export const Small = () => (
  <Select>
    <SelectTrigger size="sm" className="w-40">
      <SelectValue placeholder="Small" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="one">One</SelectItem>
      <SelectItem value="two">Two</SelectItem>
    </SelectContent>
  </Select>
);

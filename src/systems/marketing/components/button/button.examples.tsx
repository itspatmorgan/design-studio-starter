import { Button } from './button';
import { ArrowRight } from '@untitledui/icons';
export const Actions = () => <div className="flex flex-wrap gap-3"><Button size="lg" iconTrailing={ArrowRight}>Get started</Button><Button color="secondary" size="lg">Explore the demo</Button></div>;
export const States = () => <div className="flex flex-wrap gap-3"><Button isDisabled>Unavailable</Button><Button isLoading>Loading</Button></div>;
export const Links = () => <div className="flex gap-4"><Button href="https://www.untitledui.com/react" color="link-color">Untitled UI</Button><Button href="https://github.com/untitleduico/react" color="link-gray">Source</Button></div>;

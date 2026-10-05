import { Alert, AlertTitle, AlertDescription } from '@/systems/studio/components/alert';
export const Note = () => <Alert role="note"><AlertTitle>Settings are shared through Git</AlertTitle><AlertDescription>Changes save locally. Share them through your team’s Git workflow.</AlertDescription></Alert>;
export const Error = () => <Alert variant="destructive"><AlertTitle>Settings could not save</AlertTitle><AlertDescription>Reload settings before trying again.</AlertDescription></Alert>;

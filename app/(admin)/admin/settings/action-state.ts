export type SiteSettingsActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export const initialSiteSettingsActionState: SiteSettingsActionState = {
  status: 'idle',
};

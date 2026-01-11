import { useEffect } from 'react';

const DISCORD_INVITE_URL = 'https://discord.com/invite/micro-jam-1190868995226730616';

function DiscordRedirect() {
  useEffect(() => {
    window.location.href = DISCORD_INVITE_URL;
  }, []);

  return null;
}

export default DiscordRedirect;


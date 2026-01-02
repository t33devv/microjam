import { useEffect, useMemo, useState } from "react";
import { winners } from "../data/winners";
import { jams } from "../data/jams";
import apiClient from "../services/apiClient";

const buildJamLookup = () => {
  return jams.reduce((acc, jam) => {
    if (!jam?.itchUrl) return acc;
    const slug = jam.itchUrl.split("/").pop();
    if (slug) {
      acc[slug] = jam;
    }
    return acc;
  }, {});
};

const jamLookup = buildJamLookup();

const normalizeCategoryLabel = (category) => {
  if (!category) return "category";
  return category
    .replace(/[-_]/g, " ")
    .replace(/overall/i, "overall podium")
    .toLowerCase();
};

const getDisplayName = (contributor, profiles = {}) => {
  const discordId = getContributorDiscordId(contributor);
  const profile = discordId ? profiles[discordId] : undefined;
  if (profile?.displayName) return profile.displayName;
  if (profile?.username) return profile.username;

  if (contributor?.discordName) return contributor.discordName;
  if (contributor?.discordHandle) return contributor.discordHandle;

  const idTail = discordId?.slice(-4);
  if (idTail) return `user-${idTail}`;

  if (contributor?.discordUrl) {
    const maybeId = contributor.discordUrl.split("/").pop();
    if (maybeId) return `user-${maybeId.slice(-4)}`;
  }

  return "mystery player";
};

const getAvatarSrc = (contributor, profiles = {}) => {
  const discordId = getContributorDiscordId(contributor);
  const profile = discordId ? profiles[discordId] : undefined;
  
  // If we have a profile with avatarUrl, use it directly
  if (profile?.avatarUrl) return profile.avatarUrl;

  // If we have direct avatar URLs from contributor, use them
  if (contributor?.avatarUrl) return contributor.avatarUrl;
  if (contributor?.discordAvatar) return contributor.discordAvatar;

  // If we have a profile but no avatarUrl, try to construct it
  if (profile?.id && profile?.avatar) {
    // Use window.devicePixelRatio to get appropriate size for the device
    const size = Math.floor(128 * (typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1));
    return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=${size}`;
  }

  // Fallback to default Discord avatar based on user ID
  const fallbackIndex = Number(discordId || 0) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
};

const getContributorDiscordId = (contributor) => {
  const rawId = (contributor?.discordId ?? "").trim();
  if (rawId) return rawId;

  const url = contributor?.discordUrl;
  if (url) {
    const maybeId = url.split("/").filter(Boolean).pop();
    return maybeId?.trim() ?? "";
  }

  return "";
};

const contributorKey = (contributor, suffix = "") =>
  `${getContributorDiscordId(contributor) || contributor?.discordUrl || contributor?.discordHandle || contributor?.discordName || "unknown"}-${suffix}`;

const getContributorProfileUrl = (contributor) => {
  if (contributor?.discordUrl) return contributor.discordUrl;
  const id = getContributorDiscordId(contributor);
  if (id) return `https://discord.com/users/${id}`;
  return undefined;
};

const mapContributorsWithProfiles = (contributors, profiles) =>
  contributors.map((contributor) => ({
    key: contributorKey(contributor, "names"),
    name: getDisplayName(contributor, profiles),
    profileUrl: getContributorProfileUrl(contributor),
    avatarUrl: getAvatarSrc(contributor, profiles),
  }));

const formatOrdinalPlace = (place) => {
  const numericPlace = Number(place);
  if (Number.isNaN(numericPlace)) return place;

  const suffixRules = ["th", "st", "nd", "rd"];
  const v = numericPlace % 100;
  const suffix = suffixRules[(v - 20) % 10] || suffixRules[v] || suffixRules[0];
  return `${numericPlace}${suffix}`;
};

const winnerContributors = (winner) => {
  if (Array.isArray(winner?.contributors) && winner.contributors.length > 0) {
    return winner.contributors;
  }

  if (winner?.discordId || winner?.discordUrl) {
    return [
      {
        discordId: winner.discordId,
        discordUrl: winner.discordUrl,
        discordName: winner.discordName,
        discordHandle: winner.discordHandle,
        avatarUrl: winner.avatarUrl,
      },
    ];
  }

  return [];
};

const groupWinners = () => {
  return winners.reduce((acc, winner) => {
    const jam = winner.jam ?? "unknown-jam";
    const category = winner.category ?? "uncategorized";

    if (!acc[jam]) acc[jam] = {};
    if (!acc[jam][category]) acc[jam][category] = [];

    acc[jam][category].push(winner);
    return acc;
  }, {});
};

const jamEntries = Object.entries(groupWinners()).sort((a, b) =>
  a[0] < b[0] ? 1 : -1,
);

const podiumStyles = {
  1: {
    border: "border-[#d4af37]",
    bg: "bg-[#d4af37]/15",
    accent: "text-[#ffecb3]",
  },
  2: {
    border: "border-[#c0c0c0]",
    bg: "bg-[#c0c0c0]/15",
    accent: "text-[#f5f5f5]",
  },
  3: {
    border: "border-[#cd7f32]",
    bg: "bg-[#cd7f32]/15",
    accent: "text-[#ffd2aa]",
  },
};

const ContributorOrbit = ({ contributors, profiles }) => {
  const total = Math.max(contributors.length, 1);
  const avatarSize = total === 1 ? 48 : 40;
  const radius = total === 1 ? 0 : total === 2 ? 32 : 44; // keep within 64px half size of container

  const computePosition = (index) => {
    if (total === 1) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div className="absolute inset-5 rounded-full border border-li/30 opacity-40" />
      {contributors.map((contributor, index) => (
        <a
          key={contributorKey(contributor, `orbit-${index}`)}
          href={getContributorProfileUrl(contributor)}
          target="_blank"
          rel="noreferrer"
          className="absolute block"
          style={computePosition(index)}
        >
          <span
            className="block rounded-full border border-primary/60 shadow-[0_0_10px_rgba(0,0,0,0.45)] overflow-hidden"
            style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
          >
            <img
              src={getAvatarSrc(contributor, profiles)}
              alt={`${getDisplayName(contributor, profiles)} discord avatar`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </span>
        </a>
      ))}
    </div>
  );
};

const Podium = ({ winners: podiumWinners, profiles }) => {
  const orderedPlaces = [2, 1, 3];
  const heights = {
    1: "md:min-h-[15rem] min-h-[11rem]",
    2: "md:min-h-[13rem] min-h-[10rem]",
    3: "md:min-h-[12rem] min-h-[9rem]",
  };

  return (
    <div className="mt-4">
      <div className="flex items-end justify-center gap-3 md:gap-6">
        {orderedPlaces.map((place) => {
          const entry = podiumWinners.find(
            (winner) => Number(winner.place) === place,
          );
          if (!entry) {
            return (
              <div
                key={`empty-${place}`}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className={`w-full max-w-[140px] ${heights[place]} bg-li/20 border border-li/40 rounded-t-lg flex items-end justify-center pb-4`}
                >
                  <span className="text-li text-xs">pending</span>
                </div>
                <p className="text-li text-xs mt-2 uppercase tracking-[0.3em]">
                  {place === 1 ? "1st" : place === 2 ? "2nd" : "3rd"}
                </p>
              </div>
            );
          }

          return (
            <div
              key={`${entry.jam}-${entry.category}-${place}`}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className={`w-full max-w-[150px] ${heights[place]} ${podiumStyles[place].bg} ${podiumStyles[place].border} rounded-t-lg flex flex-col items-center justify-between pb-3 pt-4 px-3 text-center`}
              >
                <ContributorOrbit
                  contributors={winnerContributors(entry)}
                  profiles={profiles}
                />
                <div className="space-y-1">
                  {mapContributorsWithProfiles(
                    winnerContributors(entry),
                    profiles,
                  ).map(({ key, name, profileUrl }) => (
                    <a
                      key={key}
                      href={profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white text-xs font-bold block hover:underline"
                    >
                      {name}
                    </a>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-white text-xs uppercase tracking-[0.2em]">game</p>
                  <a
                    href={entry.gameUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-sm font-bold block"
                  >
                    {entry.gameName ?? "Play entry"}
                  </a>
                </div>
              </div>
              <p className={`${podiumStyles[place].accent} text-xs mt-2 uppercase tracking-[0.3em]`}>
                {place === 1 ? "1st" : place === 2 ? "2nd" : "3rd"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CategoryHighlights = ({ categories, profiles }) => {
  const highlights = Object.entries(categories)
    .filter(([category]) => category !== "overall")
    .flatMap(([category, entries]) =>
      [...entries]
        .sort((a, b) => Number(a.place) - Number(b.place))
        .map((entry) => ({ category, entry })),
    );

  if (!highlights.length) return null;

  return (
    <div className="mt-6">
      <p className="text-li text-xs uppercase tracking-[0.35em]">more winners</p>
      <div className="mt-3 space-y-2">
        {highlights.map(({ category, entry }) => {
          const contributors = mapContributorsWithProfiles(
            winnerContributors(entry),
            profiles,
          );

          return (
            <div
              key={`${category}-${entry.jam}-${entry.place}`}
              className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm"
            >
              <div className="flex items-center gap-2 flex-wrap text-white font-bold">
                <span className="text-primary uppercase tracking-[0.25em] text-xs">
                  {normalizeCategoryLabel(category)}
                </span>
                <span className="text-li text-xs uppercase tracking-[0.2em]">
                  {formatOrdinalPlace(entry.place)} place
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {contributors.map(({ key, name, profileUrl, avatarUrl }) => (
                  <a
                    key={key}
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-white underline decoration-dotted"
                  >
                    <span className="w-6 h-6 rounded-full border border-primary/40 overflow-hidden flex-shrink-0">
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    </span>
                    <span>{name}</span>
                  </a>
                ))}
              </div>
              <a
                href={entry.gameUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                {entry.gameName ?? "game"} ↗
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function HoF() {
  const contributorIds = useMemo(() => {
    const ids = new Set();
    winners.forEach((winner) => {
      winnerContributors(winner).forEach((contributor) => {
        const discordId = getContributorDiscordId(contributor);
        if (discordId) {
          ids.add(discordId);
        }
      });
    });
    return Array.from(ids);
  }, []);

  const [discordProfiles, setDiscordProfiles] = useState({});
  const [expandedJams, setExpandedJams] = useState(() => new Set());

  const toggleJam = (jamSlug) => {
    setExpandedJams((prev) => {
      const next = new Set(prev);
      if (next.has(jamSlug)) {
        next.delete(jamSlug);
      } else {
        next.add(jamSlug);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!contributorIds.length || typeof window === "undefined") return undefined;

    let ignore = false;

    const fetchProfiles = async () => {
      try {
        const responses = await Promise.all(
          contributorIds.map(async (discordId) => {
            try {
              const { data } = await apiClient.get(`/discord/users/${discordId}`);
              const resolvedId = data?.id ?? discordId;
              const avatarUrl = data?.avatar
                ? `https://cdn.discordapp.com/avatars/${resolvedId}/${data.avatar}.png?size=128`
                : undefined;

              return {
                id: resolvedId,
                displayName: data?.global_name || data?.display_name || data?.username,
                username: data?.username,
                avatarUrl,
              };
            } catch (error) {
              console.error(`Failed to load Discord user ${discordId}`, error?.response?.data || error.message);
              return { id: discordId };
            }
          }),
        );

        if (ignore) return;

        setDiscordProfiles(
          responses.reduce((acc, profile) => {
            if (profile?.id) {
              acc[profile.id] = profile;
            }
            return acc;
          }, {}),
        );
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load Discord profiles", error);
        }
      }
    };

    fetchProfiles();

    return () => {
      ignore = true;
    };
  }, [contributorIds]);

  if (!jamEntries.length) {
    return (
      <div className="px-4 md:px-0 mt-[6rem]">
        <p className="text-white text-2xl font-bold">Jam winners</p>
        <p className="text-li text-base font-bold mt-2">
          We are still collecting historical data.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 mt-[4rem] md:mt-[6rem]">
      <div>
        <p className="text-white text-2xl md:text-3xl font-bold">
          🏆 jam winners
        </p>
        <p className="text-nm text-sm md:text-base font-bold mt-3 max-w-3xl">
          grouped by jam & category so you can quickly spot the best builds.
          overall winners show up on the podium, while other categories list
          their finalists below.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {jamEntries.map(([jamSlug, categories]) => {
          const jamMeta = jamLookup[jamSlug];
          const jamTitle = jamMeta?.title ?? jamSlug.replace(/-/g, " ");
          const jamUrl = jamMeta?.itchUrl ?? `https://itch.io/jam/${jamSlug}`;
          const categoryEntries = Object.entries(categories).sort((a, b) => {
            if (a[0] === "overall") return -1;
            if (b[0] === "overall") return 1;
            return a[0].localeCompare(b[0]);
          });
          const isExpanded = expandedJams.has(jamSlug);
          const [jamTitlePrimary, jamTitleSecondary] = jamTitle
            .split(":")
            .map((part) => part.trim());

          return (
            <section
              key={jamSlug}
              className="border border-li/30 bg-black/30 rounded-2xl p-5 md:p-8 shadow-[0_0_25px_rgba(0,0,0,0.25)]"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-muted text-xs uppercase tracking-[0.4em]">
                    {jamSlug}
                  </p>
                  <p className="text-white text-xl md:text-2xl font-bold">
                    {jamTitlePrimary}
                  </p>
                  {jamTitleSecondary && (
                    <p className="text-primary text-lg md:text-xl font-bold">
                      {jamTitleSecondary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={jamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-sm md:text-base font-bold"
                  >
                    view jam page ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleJam(jamSlug)}
                    className="text-white font-bold text-sm border border-li/40 rounded-full px-3 py-1"
                  >
                    {isExpanded ? "hide" : "show"}
                  </button>
                </div>
              </div>

              <div
                className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-[2000px] mt-6" : "max-h-0"}`}
              >
                <Podium winners={categories.overall ?? []} profiles={discordProfiles} />
                <CategoryHighlights categories={categories} profiles={discordProfiles} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default HoF;
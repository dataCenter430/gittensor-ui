import React, { useCallback, useMemo } from 'react';
import { Avatar, Box, CircularProgress, Typography } from '@mui/material';
import {
  type SxProps,
  type Theme,
  alpha,
  useTheme,
} from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { RANK_COLORS } from '../../../theme';
import { getGithubAvatarSrc } from '../../../utils';
import { credibilityColor } from '../../../utils/format';
import { type DashboardFeaturedContributor } from '../dashboardData';

interface Props {
  discoverers: DashboardFeaturedContributor[];
  isLoading?: boolean;
  viewAllHref?: string;
}

const FONTS = { mono: '"JetBrains Mono", ui-monospace, monospace' } as const;
const ACCENT = [RANK_COLORS.first, RANK_COLORS.second, RANK_COLORS.third];
const monoBase = { fontFamily: FONTS.mono } as const;
const clampCredibility = (v: number): number => Math.min(Math.max(v, 0), 1);
const formatEarnings = (usd: number): string => `$${Math.round(usd)}/d`;
const formatCredPercent = (pct: number): string => `${Math.round(pct * 100)}%`;

const buildMonoSx = (
  size: string,
  weight: number,
  color: string,
  extra?: SxProps<Theme>,
): SxProps<Theme> => ({
  ...monoBase,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1,
  ...((extra ?? {}) as Record<string, unknown>),
});

const buildPillSx = (
  color: string,
  bg: string,
  border?: string,
): SxProps<Theme> => ({
  ...monoBase,
  fontSize: '0.5rem',
  fontWeight: 600,
  color,
  backgroundColor: bg,
  ...(border ? { border: `1px solid ${border}` } : {}),
  borderRadius: 99,
  px: 1,
  py: 0.2,
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
});

const buildLabelSx = (primary: string, opacity: number): SxProps<Theme> => ({
  ...monoBase,
  fontSize: '0.5rem',
  fontWeight: 600,
  color: alpha(primary, opacity),
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  lineHeight: 1,
});

const buildTrackSx = (bg: string): SxProps<Theme> => ({
  flex: 1,
  height: 6,
  borderRadius: 3,
  backgroundColor: bg,
  overflow: 'hidden',
});

const buildFillSx = (width: string, color: string): SxProps<Theme> => ({
  width,
  height: '100%',
  borderRadius: 3,
  backgroundColor: color,
  transition: 'width 0.4s ease',
});

const buildOverlaySx = (): SxProps<Theme> => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const buildRowBaseSx = (
  border: string,
  accent: string,
  bg: string,
  hoverBg: string,
): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  borderRadius: 2,
  border: `1px solid ${border}`,
  borderLeft: `3px solid ${accent}`,
  backgroundColor: bg,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&:hover': { backgroundColor: hoverBg, borderColor: alpha(accent, 0.5) },
});

const buildAvatarSx = (accent: string, sz: number): SxProps<Theme> => ({
  width: sz,
  height: sz,
  border: `2px solid ${alpha(accent, 0.4)}`,
  flexShrink: 0,
});

const buildEllipsisSx = (
  size: string,
  weight: number,
  color: string,
): SxProps<Theme> => ({
  ...monoBase,
  fontSize: size,
  fontWeight: weight,
  color,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.2,
});

const buildLabelPillSx = (accent: string): SxProps<Theme> => ({
  ...monoBase,
  fontSize: '0.56rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: alpha(accent, 0.85),
  backgroundColor: alpha(accent, 0.1),
  borderRadius: 99,
  px: 1,
  py: 0.15,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.3,
  display: 'inline-block',
  maxWidth: '100%',
});

interface RepoPillProps {
  repo: string;
  accent: string;
  githubId: string;
}

const RepoPill: React.FC<RepoPillProps> = ({ repo, accent, githubId }) => {
  const displayName = useMemo(() => repo.split('/').pop() || repo, [repo]);
  const sx = useMemo(
    () =>
      buildPillSx(alpha(accent, 0.85), alpha(accent, 0.1), alpha(accent, 0.25)),
    [accent],
  );
  return (
    <Box key={`r-${githubId}-${repo}`} sx={sx}>
      {displayName}
    </Box>
  );
};

const InlineStat: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color }) => {
  const theme = useTheme();
  const labelSx = useMemo(
    () => buildLabelSx(theme.palette.text.primary, 0.4),
    [theme.palette.text.primary],
  );
  const valueSx = useMemo(
    () =>
      buildMonoSx('0.82rem', 700, color ?? theme.palette.text.primary, {
        lineHeight: 1.2,
        mt: 0.15,
      }),
    [color, theme.palette.text.primary],
  );
  return (
    <Box sx={{ textAlign: 'left' }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography sx={valueSx}>{value}</Typography>
    </Box>
  );
};

const CredBar: React.FC<{ value: number }> = ({ value }) => {
  const theme = useTheme();
  const pct = clampCredibility(value);
  const color = pct > 0 ? credibilityColor(pct) : theme.palette.border.light;
  const labelSx = useMemo(
    () => buildLabelSx(theme.palette.text.primary, 0.4),
    [theme.palette.text.primary],
  );
  const credSx = useMemo(
    () => buildMonoSx('0.72rem', 700, color, { flexShrink: 0 }),
    [color],
  );
  const trackSx = useMemo(
    () => buildTrackSx(alpha(theme.palette.common.white, 0.06)),
    [theme.palette.common.white],
  );
  const fillSx = useMemo(
    () => buildFillSx(`${pct * 100}%`, color),
    [pct, color],
  );
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%' }}
    >
      <Typography sx={{ ...labelSx, flexShrink: 0 }}>Cred</Typography>
      <Typography sx={credSx}>{formatCredPercent(pct)}</Typography>
      <Box sx={trackSx}>
        <Box sx={fillSx} />
      </Box>
    </Box>
  );
};

const CredGauge: React.FC<{ value: number }> = ({ value }) => {
  const theme = useTheme();
  const pct = clampCredibility(value);
  const color = pct > 0 ? credibilityColor(pct) : theme.palette.border.light;
  const size = 44;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const numSx = useMemo(() => buildMonoSx('0.72rem', 800, color), [color]);
  const tagSx = useMemo(
    () => buildLabelSx(theme.palette.text.primary, 0.4),
    [theme.palette.text.primary],
  );
  const overlaySx = useMemo(() => buildOverlaySx(), []);
  const bgStroke = useMemo(
    () => alpha(theme.palette.common.white, 0.06),
    [theme.palette.common.white],
  );
  return (
    <Box
      sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgStroke}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <Box sx={overlaySx}>
        <Typography sx={numSx}>{Math.round(pct * 100)}</Typography>
        <Typography sx={{ ...tagSx, fontSize: '0.38rem', mt: 0.15 }}>
          Cred
        </Typography>
      </Box>
    </Box>
  );
};

const DiscovererRow: React.FC<{
  d: DashboardFeaturedContributor;
  rank: number;
  onClick: () => void;
}> = ({ d, rank, onClick }) => {
  const theme = useTheme();
  const accent = ACCENT[rank] ?? alpha(theme.palette.status.award, 0.5);
  const avatarUsername = d.githubUsername ?? d.githubId;
  const cred = d.credibility ?? 0;
  const earn = d.earnings?.usdPerDay ?? 0;

  const repoPills = useMemo(
    () =>
      d.repos.length > 0
        ? d.repos.map((repo) => (
            <RepoPill
              key={`r-${d.githubId}-${repo}`}
              repo={repo}
              accent={accent}
              githubId={d.githubId}
            />
          ))
        : null,
    [d.repos, d.githubId, accent],
  );

  const labelPill = useMemo(
    () => <Box sx={buildLabelPillSx(accent)}>{d.featuredLabel}</Box>,
    [d.featuredLabel, accent],
  );

  const nameText = useMemo(
    () => (
      <Typography
        sx={buildEllipsisSx(
          '0.6rem',
          600,
          alpha(theme.palette.text.primary, 0.55),
        )}
      >
        {d.name}
      </Typography>
    ),
    [d.name, theme.palette.text.primary],
  );

  const baseSx = useMemo(
    () =>
      buildRowBaseSx(
        theme.palette.border.light,
        accent,
        theme.palette.common.black,
        theme.palette.surface.subtle,
      ),
    [
      theme.palette.border.light,
      accent,
      theme.palette.common.black,
      theme.palette.surface.subtle,
    ],
  );

  const mobileAvatarSx = useMemo(() => buildAvatarSx(accent, 32), [accent]);
  const desktopAvatarSx = useMemo(() => buildAvatarSx(accent, 36), [accent]);

  const rankSxMobile = useMemo(
    () => buildMonoSx('0.82rem', 800, accent, { flexShrink: 0 }),
    [accent],
  );
  const rankSxDesktop = useMemo(
    () => buildMonoSx('0.88rem', 800, accent, { textAlign: 'center' }),
    [accent],
  );
  const nameSxMobile = useMemo(
    () => buildEllipsisSx('0.82rem', 700, theme.palette.text.primary),
    [theme.palette.text.primary],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const renderStats = useCallback(
    (statsGap: number) => (
      <>
        <InlineStat
          label="Score"
          value={d.score?.toLocaleString() ?? '0'}
          color={accent}
        />
        {(d.solvedIssues ?? 0) > 0 && (
          <InlineStat label="Solved" value={`${d.solvedIssues}`} />
        )}
        {earn > 0 && (
          <InlineStat
            label="Earn"
            value={formatEarnings(earn)}
            color={theme.palette.status.success}
          />
        )}
        {repoPills && repoPills.length > 0 && (
          <Box sx={{ display: 'flex', gap: statsGap, flexWrap: 'wrap' }}>
            {repoPills}
          </Box>
        )}
      </>
    ),
    [
      d.score,
      d.solvedIssues,
      earn,
      accent,
      theme.palette.status.success,
      repoPills,
    ],
  );

  const renderCredDesktop = useCallback(
    () =>
      cred > 0 ? (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%' }}>
            <CredBar value={cred} />
          </Box>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
            }}
          >
            <CredGauge value={cred} />
          </Box>
        </>
      ) : (
        <Box />
      ),
    [cred],
  );

  const renderReposDesktop = useCallback(
    () =>
      repoPills ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {repoPills}
        </Box>
      ) : (
        <Box />
      ),
    [repoPills],
  );

  return (
    <>
      {/* Mobile card (<600px) */}
      <Box
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        sx={{
          ...baseSx,
          display: { xs: 'grid', sm: 'none' },
          gridTemplateColumns: '1fr auto',
          gap: 0.75,
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={rankSxMobile}>#{rank + 1}</Typography>
            <Avatar
              src={getGithubAvatarSrc(avatarUsername)}
              alt={avatarUsername}
              sx={mobileAvatarSx}
            />
            <Typography sx={nameSxMobile}>{d.name}</Typography>
          </Box>
          <Box sx={{ mt: 0.3 }}>{labelPill}</Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mt: 0.75,
              flexWrap: 'wrap',
            }}
          >
            {renderStats(0.5)}
          </Box>
        </Box>
        {cred > 0 ? <CredGauge value={cred} /> : <Box />}
      </Box>

      {/* Desktop subgrid row (≥600px) */}
      <Box
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        sx={{
          ...baseSx,
          display: { xs: 'none', sm: 'grid' },
          gridColumn: '1 / -1',
          gridTemplateColumns: 'subgrid',
          alignItems: 'center',
        }}
      >
        <Typography sx={rankSxDesktop}>#{rank + 1}</Typography>
        <Avatar
          src={getGithubAvatarSrc(avatarUsername)}
          alt={avatarUsername}
          sx={desktopAvatarSx}
        />
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          {labelPill}
          <Box sx={{ mt: 0.25 }}>{nameText}</Box>
        </Box>
        <InlineStat
          label="Score"
          value={d.score?.toLocaleString() ?? '0'}
          color={accent}
        />
        {(d.solvedIssues ?? 0) > 0 ? (
          <InlineStat label="Solved" value={`${d.solvedIssues}`} />
        ) : (
          <Box />
        )}
        {earn > 0 ? (
          <InlineStat
            label="Earn"
            value={formatEarnings(earn)}
            color={theme.palette.status.success}
          />
        ) : (
          <Box />
        )}
        {renderCredDesktop()}
        {renderReposDesktop()}
      </Box>
    </>
  );
};

const FeaturedDiscoverersSpotlight: React.FC<Props> = ({
  discoverers,
  isLoading = false,
  viewAllHref,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const open = useCallback(
    (githubId: string) =>
      navigate(
        `/miners/details?githubId=${encodeURIComponent(githubId)}&mode=issues`,
        { state: { backTo: '/dashboard' } },
      ),
    [navigate],
  );

  const headerSx = useMemo(
    () =>
      buildMonoSx(
        undefined as unknown as string,
        700,
        theme.palette.text.primary,
      ),
    [theme.palette.text.primary],
  );

  const viewAllSx = useMemo(
    (): SxProps<Theme> => ({
      ...theme.typography.tooltipLabel,
      color: alpha(theme.palette.text.primary, 0.45),
      cursor: 'pointer',
      '&:hover': { color: theme.palette.text.primary },
    }),
    [theme.typography.tooltipLabel, theme.palette.text.primary],
  );

  const containerSx = useMemo(
    (): SxProps<Theme> => ({
      width: '100%',
      p: { xs: 1.25, sm: 1.5 },
      borderRadius: 3,
      border: `1px solid ${theme.palette.border.light}`,
    }),
    [theme.palette.border.light],
  );

  // 8-column grid: rank | avatar | name/label | Score | Solved | Earn | Cred | Repos
  const gridSx = useMemo(
    (): SxProps<Theme> => ({
      display: { xs: 'flex', sm: 'grid' },
      flexDirection: 'column',
      gridTemplateColumns: {
        sm: '26px 40px auto repeat(3, auto) 1fr minmax(0, 120px)',
        lg: '26px 40px auto repeat(3, auto) 1fr auto',
      },
      columnGap: 1.5,
      rowGap: 0.75,
      gap: { xs: 0.75 },
    }),
    [],
  );

  return (
    <Box sx={containerSx}>
      <Box
        sx={{
          mb: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{ ...headerSx, fontSize: { xs: '1.02rem', sm: '1.1rem' } }}
        >
          Featured Discoverers
        </Typography>
        {viewAllHref && (
          <Typography onClick={() => navigate(viewAllHref)} sx={viewAllSx}>
            view all →
          </Typography>
        )}
      </Box>
      {isLoading ? (
        <Box
          sx={{
            minHeight: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      ) : discoverers.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          No discoverer highlights available.
        </Typography>
      ) : (
        <Box sx={gridSx}>
          {discoverers.map((d, i) => (
            <DiscovererRow
              key={`${d.featuredLabel}-${d.githubId}`}
              d={d}
              rank={i}
              onClick={() => open(d.githubId)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FeaturedDiscoverersSpotlight;

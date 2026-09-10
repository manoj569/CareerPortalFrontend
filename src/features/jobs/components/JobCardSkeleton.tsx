import { Card, CardContent, Skeleton, Stack } from '@mui/material';

export const JobCardSkeleton = () => (
  <Card aria-busy="true" aria-label="Loading job" component="article">
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Skeleton height={52} variant="rounded" width={52} />
        <Skeleton height={32} width="78%" />
        <Skeleton width="48%" />
        <Skeleton width="90%" />
        <Skeleton width="82%" />
        <Skeleton height={40} variant="rounded" width={120} />
      </Stack>
    </CardContent>
  </Card>
);

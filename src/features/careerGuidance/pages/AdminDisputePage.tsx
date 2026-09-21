import { useParams } from 'react-router-dom';
import { Paper, Stack, Typography } from '@mui/material';
import { useGetCareerDisputeQuery } from '../api/trustApi';
import { DisputeDetail } from '../components/DisputeDetail';
import { GuidanceError, GuidanceLoading, GuidanceNavigation, GuidancePage } from '../components/GuidanceUI';
export default function AdminDisputePage(){const {id=''}=useParams();const q=useGetCareerDisputeQuery({audience:'admin',id});return <GuidancePage title="Dispute detail"><GuidanceNavigation admin/>{q.isLoading?<GuidanceLoading/>:q.isError?<GuidanceError error={q.error} retry={q.refetch}/>:q.data&&<Paper sx={{p:3}}><Stack spacing={2}><Typography variant="h3">Booking dispute</Typography><DisputeDetail dispute={q.data} audience="admin" refreshing={q.isFetching}/></Stack></Paper>}</GuidancePage>}

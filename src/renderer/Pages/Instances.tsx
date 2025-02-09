import * as React from 'react';
import { InstanceRow } from 'renderer/types';

import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import SyncIcon from '@mui/icons-material/Sync';

import { InstanceSettingsAlert, InstanceSettingsComplete } from '../Components/Alerts';
import BuildMenu from '../Components/BuildMenu';
import InstanceMenu from '../Components/InstanceMenu';

export default function Instances() {
	const [rows, setRows] = React.useState<InstanceRow[]>([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		if (InstanceSettingsComplete()) {
			window.electronAPI
				.getInstances()
				.then((instances) => {
					setLoading(false);
					setRows(instances);
				})
				.catch((e) => {
					console.error(e);
				});
		}
	}, []);

	return (
		<>
			{InstanceSettingsComplete() ? (
				<>
					<TableContainer component={Paper}>
						<Table aria-label='simple table'>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Version</TableCell>
									<TableCell>Install Path</TableCell>
									<TableCell>Database</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows
									.sort((a, b) => (a.name > b.name ? 1 : -1))
									.map((row) => (
										<TableRow key={row.name} hover>
											<TableCell component='th' scope='row'>
												<Link href={'http://' + window.appSettings?.hostname + row.path} target='_blank'>
													{row.name}
												</Link>
											</TableCell>
											<TableCell sx={{ paddingTop: 0.5, paddingBottom: 0.5 }}>{row.version && <BuildMenu build={row.version} button='button' />}</TableCell>
											<TableCell sx={{ paddingTop: 0.5, paddingBottom: 0.5 }}>
												<Button
													onClick={() => {
														window.electronAPI.openDirectory(row.installPath);
													}}
													color='inherit'
													sx={{ textTransform: 'none' }}
												>
													{row.installPath}
												</Button>
											</TableCell>
											<TableCell>
												<Tooltip
													title={
														<div>
															DB: {row?.dbSize?.toFixed(2)} GB
															<br />
															Log: {row?.dbLogSize?.toFixed(2)} GB
															<br />
															Total: {row?.dbTotalSize?.toFixed(2)} GB
														</div>
													}
													followCursor
												>
													<Box>{row.dbName}</Box>
												</Tooltip>
											</TableCell>
											<TableCell sx={{ paddingTop: 0.5, paddingBottom: 0.5 }}>
												<InstanceMenu instance={row} />
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
						{rows.length == 0 || loading == true ? (
							<Box sx={{ width: '100%' }}>
								<LinearProgress />
							</Box>
						) : (
							<></>
						)}
					</TableContainer>
					<br />
					<Button
						sx={{
							float: 'right',
						}}
						variant='contained'
						endIcon={<SyncIcon />}
						onClick={() => {
							setLoading(true);
							setRows([]);

							window.electronAPI.reloadInstances().then((val) => {
								window.electronAPI.getInstances().then((instances) => {
									setLoading(false);
									setRows(instances);
								});
							});
						}}
					>
						Reload Instances
					</Button>
				</>
			) : (
				<InstanceSettingsAlert />
			)}
		</>
	);
}

import React, { ElementType } from 'react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { mainnet, goerli, optimism, optimismGoerli, arbitrum, polygon, sepolia } from 'wagmi/chains';
// import Donate3Btn from './Donate3Btn';
import xlsx, { IJsonSheet } from 'json-as-xlsx';
import { useLottie } from 'lottie-react';
import { Linea as linea } from '@/utils/linea';

import { Box, Grid, Paper, Stack, Tooltip, Link, Typography, styled, Backdrop, SvgIcon, TextField, OutlinedInput, FormControl, Select, MenuItem, SelectChangeEvent, Button, Pagination, InputLabel } from '@mui/material';
import { ButtonProps } from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import loadingAnimation from '../public/loading/donate3Loading.json';

import Arbitrum from '@/public/icons/networks/arbitrum.svg';
import Ethereum from '@/public/icons/networks/ethereum.svg';
import Goerli from '@/public/icons/networks/goerli.svg';
import Sepolia from '@/public/icons/networks/ethereum.svg';
import Linea from '@/public/icons/networks/linea.svg';
import Optimism from '@/public/icons/networks/optimism.svg';
// import Pgn from '@/public/icons/networks/pgn.svg';
import Polygon from '@/public/icons/networks/polygon.svg';

import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

import { getFasterIpfsLink } from '@/utils/ipfsTools';
import API from '../common/API';
// import { json } from 'stream/consumers';

// const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_EHTERSCAN_API_KEY;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#f1f0f5',
    color: '#B5B5C3',
    fontSize: '12px',
    fontWeight: 700,
    padding: 0,
    border: 'none',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

type Address = `0x${string}`;

interface Coin {
  name: string;
  icon: string;
  explorer: string;
  eas: string;
}

interface CoinList {
  [key: number]: Coin;
}

interface Chain {
  name: string;
  icon: string;
  coin: CoinList;
}

interface ChainList {
  [key: string]: Chain;
}

interface DonateItem {
  blockHash: string;
  blockNumber: number;
  chainId: number;
  erc20: string;
  from: string;
  id: number;
  message: string;
  money: string;
  timestamp: string;
  to: string;
  transactionHash: string;
  uid: string;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(Number(timestamp));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const w2e = (w: number) => {
  return (w / 1000_000_000_000_000_000).toFixed(4);
};

const networks = [mainnet, goerli, optimism, optimismGoerli, arbitrum, polygon, linea, sepolia];

const icons: { [key: string]: ElementType } = {
  '1': Ethereum,
  '5': Goerli,
  '10': Optimism,
  '42161': Arbitrum,
  '137': Polygon,
  '59144': Linea,
  '420': Optimism,
  '11155111': Sepolia,
  // {  '424': Pgn },
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SearchButton = styled(Button)<ButtonProps>(() => ({
  color: '#fff',
  backgroundColor: '#0F172A',
  '&:hover': {
    backgroundColor: '#0F172A',
  },
}));

const formatSortIcon = (sort: number) => {
  if (sort) {
    if (sort === 1) {
      return <SouthIcon sx={{ fontSize: 12 }} />;
    } else if (sort === 2) {
      return <NorthIcon sx={{ fontSize: 12 }} />;
    }
  } else {
    return null;
  }
};

export default function Dashboard() {
  // const { address } = useAccount();
  // 0 not sort 1 desc 2 asc
  // if time sort, money is 0. the same rule for money.
  const [timeSort, setTimeSort] = useState(1);
  const [moneySort, setMoneySort] = useState(0);
  const [donator, setDonator] = useState('');
  const [receiveOrCid, setReceiveOrCid] = useState('');
  const [message, setMessage] = useState('');
  const [selectChainIds, setSelectChainIds] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const perPageCount = 20;
  const options = {
    animationData: loadingAnimation,
    loop: true,
  };
  const { View } = useLottie(options, {
    width: '80px',
    height: '80px',
  });

  const coinType: ChainList = {
    '80001': {
      name: 'Polygon Mumbai',
      icon: '/icons/support/polygon.svg',
      coin: {
        0: {
          name: 'MATIC',
          icon: '/icons/support/polygon.svg',
          explorer: 'https://mumbai.polygonscan.com/',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '137': {
      name: 'Polygon',
      icon: '/icons/support/polygon.svg',
      coin: {
        0: {
          name: 'MATIC',
          icon: '/icons/support/polygon.svg',
          explorer: 'https://polygonscan.com/',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '5': {
      name: 'ETH Goerli',
      icon: '/icons/support/ethereum.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/ethereum.svg',
          explorer: 'https://goerli.etherscan.io/',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '1': {
      name: 'Ethereum',
      icon: '/icons/support/ethereum.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/ethereum.svg',
          explorer: 'https://etherscan.io/tx/',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '10': {
      name: 'Optimism',
      icon: '/icons/support/optimism.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/optimism.svg',
          explorer: 'https://optimistic.etherscan.io/tx/',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '42161': {
      name: 'Arbitrum',
      icon: '/icons/support/arbitrum.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/arbitrum.svg',
          explorer: 'https://arbiscan.io/tx/',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '59144': {
      name: 'Linea',
      icon: '/icons/support/linea.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/linea.svg',
          explorer: 'https://lineascan.build/tx',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
    '11155111': {
      name: 'Sepolia',
      icon: '/icons/support/ethereum.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/ethereum.svg',
          explorer: 'https://goerli.etherscan.io/',
          eas: 'https://sepolia.easscan.org/',
        },
      },
    },
    '420': {
      name: 'Optimistic Goerli',
      icon: '/icons/support/optimism.svg',
      coin: {
        0: {
          name: 'ETH',
          icon: '/icons/support/optimism.svg',
          explorer: 'https://goerli-optimism.etherscan.io//',
          eas: 'https://optimism-goerli-bedrock.easscan.org/',
        },
      },
    },
  };

  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<DonateItem[]>([]);
  const [changePageArgs, setChangePageArgs] = useState<{ page?: number; size?: number; donator?: Address; tos?: Address[]; message?: string; chainIds?: number[] }>({ size: 20 });

  const getPageData = (obj: { page: number; from?: string; tos?: Address[]; message?: string; chainIds?: number[]; tokens?: string[]; uid?: string; time?: number; money?: number }) => {
    // const args = {
    //   from: '0x1fD144f8D069504Af50676913f81431Ea2419103',
    //   to: '0xe395B9bA2F93236489ac953146485C435D1A267B',
    //   message: 'string',
    //   chainIds: [59144],
    //   tokens: ['LINEA'],
    //   uid: 'string',
    //   page: 0,
    //   size: 20,
    //   orderBy: [
    //     {
    //       money: 'desc',
    //     },
    //     {
    //       timestamp: 'desc',
    //     },
    //   ],
    // };

    const SORT_MAP = [undefined, 'desc', 'asc'];
    let orderBy = [];
    let tmpMoney;
    if (typeof obj.money === 'number') {
      tmpMoney = obj.money;
    } else {
      tmpMoney = moneySort;
    }
    SORT_MAP[tmpMoney] && orderBy.push({ money: SORT_MAP[tmpMoney] });
    let tmpTime;
    if (typeof obj.time === 'number') {
      tmpTime = obj.time;
    } else {
      tmpTime = timeSort;
    }
    SORT_MAP[tmpTime] && orderBy.push({ timestamp: SORT_MAP[tmpTime] });

    const args = {
      from: obj?.from || undefined,
      tos: obj?.tos || undefined,
      message: obj?.message || undefined,
      chainIds: obj?.chainIds || undefined,
      tokens: obj?.tokens || undefined,
      uid: obj?.uid || undefined,
      page: obj.page,
      size: 20,
      orderBy: [...orderBy],
    };
    setOpen(true);
    API.post(`/donates`, args, {
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API_NEW || 'https://donate3.0xhardman.xyz/',
    })
      .then((result) => {
        const { data } = result;
        if (data.code === 200 && data.message === 'success') {
          const total = data?.data?.total;
          setPageCount(Math.ceil(total / perPageCount));
          setRows(data?.data?.content);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setOpen(false));
  };

  useEffect(() => {
    getPageData({ page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadFile = () => {
    let data = [
      {
        sheet: 'DonationDetail',
        columns: [
          { label: 'chainId', value: 'chainId' },
          { label: 'chain', value: (row: any) => coinType[row.chainId]?.name },
          { label: 'symbol', value: (row: any) => coinType[row.chainId]?.coin[0].name },
          { label: 'createTime', value: (row: any) => formatTimestamp(row.timestamp) },

          { label: 'message', value: 'message' },
          { label: 'tx', value: 'transactionHash' },
          { label: 'EAS UID', value: 'uid' },
          { label: 'from', value: 'from' }, // Top level data
        ],
        content: rows,
      },
      {
        sheet: 'Children',
        columns: [
          { label: 'User', value: 'user' }, // Top level data
          { label: 'Age', value: 'age', format: '# "years"' }, // Custom format
          { label: 'Phone', value: (row: any) => row?.more?.phone ?? '' }, // Run functions
        ],
        content: [
          { user: 'Manuel', age: 16, more: { phone: '99999999' } },
          { user: 'Ana', age: 17, more: { phone: '87654321' } },
        ],
      },
    ];
    let settings = {
      fileName: 'MySpreadsheet',
    };
    xlsx(data as IJsonSheet[], settings);
  };

  const handleChangeInput = (event: any, type: string) => {
    const value = event?.target.value;
    if (type === 'donator') {
      setDonator(value);
    } else if (type === 'receiveOrCid') {
      setReceiveOrCid(value);
    } else if (type === 'message') {
      setMessage(value);
    }
  };

  const handleChangeSelectChainId = (event: SelectChangeEvent<typeof selectChainIds>) => {
    const {
      target: { value },
    } = event;
    setSelectChainIds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSort = (type: string) => {
    let time = 0,
      money = 0;
    if (type === 'time') {
      if (timeSort === 1) {
        time = 2;
      } else if (timeSort === 2) {
        time = 0;
      } else if (timeSort === 0) {
        time = 1;
      }
      setTimeSort(time);
      moneySort !== 0 && setMoneySort(0);
    } else if (type === 'money') {
      if (moneySort === 0) {
        money = 1;
      } else if (moneySort === 1) {
        money = 2;
      } else if (moneySort === 2) {
        money = 0;
      }
      setMoneySort(money);
      timeSort !== 0 && setTimeSort(0);
    }
    getPageData({ page: 0, time, money });
  };

  const handleChangePage = (event: any, newPage: number) => {
    const { donator, tos, message, chainIds } = changePageArgs;
    getPageData({ from: (donator as Address) || undefined, tos: (tos as Address[])?.length ? tos : undefined, message: message || undefined, chainIds: chainIds && chainIds.length ? chainIds.map((item) => Number(item)) : undefined, page: newPage - 1 });
  };

  const handleSearch = async () => {
    if (donator || receiveOrCid || message || selectChainIds.length) {
      if (donator) {
        setChangePageArgs((preArgs) => ({ ...preArgs, from: donator }));
      }
      let tos: Address[] = [];
      if (receiveOrCid) {
        if (receiveOrCid.startsWith('0x')) {
          tos.push(receiveOrCid as Address);
          setChangePageArgs((preArgs) => ({ ...preArgs, tos: [receiveOrCid as Address] }));
        } else {
          // get address from cid
          try {
            const info = await getFasterIpfsLink({
              ipfs: `https://nftstorage.link/ipfs/${receiveOrCid}`,
              timeout: 4000,
            });
            // cid bafkreibnfk3tnrmqpgn2b3ynqo7lp7wcolrynuspq54o2dwp25dshmmmou
            const { address, safeAccounts } = info;
            const toAddressArr: Address[] = [];
            if (address) {
              toAddressArr.push(address as Address);
            }
            if (safeAccounts?.length) {
              safeAccounts.forEach((item) => {
                item.address && toAddressArr.push(item.address);
              });
            }
            tos = toAddressArr;
            setChangePageArgs((preArgs) => ({ ...preArgs, tos: toAddressArr }));
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (message) {
        setChangePageArgs((preArgs) => ({ ...preArgs, message: message }));
      }

      if (selectChainIds.length) {
        setChangePageArgs((preArgs) => ({ ...preArgs, chainIds: selectChainIds.map((item) => Number(item)) }));
      }

      setTimeout(() => {
        getPageData({ page: 0, from: donator || undefined, tos: tos.length ? tos : undefined, message: message || undefined, chainIds: selectChainIds.length ? selectChainIds.map((item) => Number(item)) : undefined });
      }, 0);
    } else {
      return;
    }
  };

  const handleReset = () => {
    setDonator('');
    setReceiveOrCid('');
    setMessage('');
    setSelectChainIds([]);
    setChangePageArgs({ page: 0 });
    getPageData({ page: 0 });
  };

  return (
    <Grid item xs={8} mb="40px">
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
        {View}
      </Backdrop>

      <Stack>
        <Typography variant="h4" color="#44443F">
          Dashboard
        </Typography>
      </Stack>

      <Box display={'flex'} width={'100%'} gap={3} mb={3} mt={4.75}>
        <Box flex={1}>
          <TextField size="small" fullWidth label="Donator address" value={donator} onChange={(e) => handleChangeInput(e, 'donator')} />
        </Box>
        <Box flex={1}>
          <TextField size="small" fullWidth label="Receiver address or CID" value={receiveOrCid} onChange={(e) => handleChangeInput(e, 'receiveOrCid')} />
        </Box>
      </Box>

      <Box display={'flex'} gap={3}>
        <Box flex={1}>
          <TextField size="small" fullWidth label="Message" value={message} onChange={(e) => handleChangeInput(e, 'message')} />
        </Box>

        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="chian-label" sx={{ mt: -1 }}>
            Chain
          </InputLabel>
          <Select labelId="chian-label" fullWidth multiple size="small" value={selectChainIds} onChange={handleChangeSelectChainId} input={<OutlinedInput label="Name" sx={{ height: '40px', overflow: 'hidden' }} />} MenuProps={MenuProps}>
            {networks.map(({ name, id }) => (
              <MenuItem key={id} value={id}>
                <SvgIcon sx={{ mr: 1 }} component={icons[id]} />
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box mt={3}>
        <SearchButton size="large" variant="contained" onClick={handleSearch}>
          Search
        </SearchButton>
        <Button size="large" sx={{ color: '#0F172A', ml: 2 }} variant="text" onClick={handleReset}>
          Reset
        </Button>
      </Box>

      <Stack mt="60px">
        <Stack justifyContent="space-between" alignItems="center" direction="row" mb="26px">
          <Typography color="#3E4343" fontWeight="600">
            Details
          </Typography>

          <Button
            sx={{
              width: '100px',
              color: '#0F172A',
            }}
            onClick={downloadFile}
          >
            <SaveAltIcon sx={{ fontSize: 16, mr: 1 }} />
            Export
          </Button>
        </Stack>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', maxWidth: '100%', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead sx={{ backgroundColor: '#f1f0f5', height: '38px' }}>
              <TableRow>
                <StyledTableCell align="center">Donator</StyledTableCell>
                <StyledTableCell align="center">Receiver</StyledTableCell>
                <StyledTableCell align="center" sx={{ cursor: 'pointer' }} onClick={() => handleSort('time')}>
                  Time {formatSortIcon(timeSort)}
                </StyledTableCell>
                <StyledTableCell align="center">Chain</StyledTableCell>
                <StyledTableCell align="center">Token</StyledTableCell>
                <StyledTableCell align="center" sx={{ cursor: 'pointer' }} onClick={() => handleSort('money')}>
                  Amount {formatSortIcon(moneySort)}
                </StyledTableCell>
                <StyledTableCell align="center">Message</StyledTableCell>
                <StyledTableCell align="center">EAS UID</StyledTableCell>
                <StyledTableCell align="center">Hash</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: DonateItem, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#fbffdc',
                    },
                  }}
                >
                  <StyledTableCell align="center" component="th" scope="row">
                    <Stack direction="row" justifyContent="center" alignItems="center" gap={1.5}>
                      <Tooltip title={row?.from} placement="bottom">
                        <Link underline="none" href={coinType[row?.chainId as unknown as string]?.coin[0].explorer + 'address/' + row?.from} target="_blank">
                          <Typography>{row?.from.slice(0, 5) + '...' + row?.from.slice(-5, -1)}</Typography>
                        </Link>
                      </Tooltip>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center" component="th" scope="row">
                    <Stack direction="row" justifyContent="center" alignItems="center" gap={1.5}>
                      <Tooltip title={row?.to} placement="bottom">
                        <Link underline="none" href={coinType[row?.chainId as unknown as string]?.coin[0].explorer + 'address/' + row?.to} target="_blank">
                          <Typography>{row?.to.slice(0, 5) + '...' + row?.to.slice(-5, -1)}</Typography>
                        </Link>
                      </Tooltip>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center" component="th" scope="row">
                    <Stack direction="row" justifyContent="center" alignItems="center" gap={1.5}>
                      <Typography>{formatTimestamp(row?.timestamp)}</Typography>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <Stack direction="row" gap={1.5} justifyContent="center">
                      <Box width="24px" component={'img'} src={coinType[row?.chainId.toString()]?.icon} />
                      <Typography>{coinType[row?.chainId.toString()]?.name}</Typography>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <Stack direction="row" gap={1.5} justifyContent="center">
                      <Box width="24px" component={'img'} src={coinType[row?.chainId.toString()]?.coin[0]?.icon} />
                      <Typography>{`${coinType[row?.chainId.toString()]?.coin[0]?.name}\n`}</Typography>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <Stack direction={'column'} alignItems="center">
                      <Typography whiteSpace="pre" align="right" lineHeight={'14px'}>
                        {`${w2e(Number(row?.money))}`}
                      </Typography>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center" sx={{ width: '140px' }}>
                    <Stack direction={'column'} alignItems="center">
                      <Typography whiteSpace="break-spaces" align="right" lineHeight={'24px'}>
                        {row?.message}
                      </Typography>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <Stack direction={'column'} alignItems="center">
                      <Typography whiteSpace="pre" align="right" lineHeight={'14px'}>
                        <Link underline="none" href={coinType[row?.chainId]?.coin[0].eas + 'attestation/view/' + row?.uid} target="_blank">
                          {row?.uid ? row?.uid?.slice(0, 5) + '...' + row?.uid?.slice(-5) : ''}
                        </Link>
                      </Typography>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <Stack direction={'column'} alignItems="center">
                      <Typography whiteSpace="pre" align="right" lineHeight={'14px'}>
                        <Link underline="none" href={coinType[row?.chainId.toString()]?.coin[0].explorer + 'tx/' + row?.transactionHash} target="_blank">
                          {row?.transactionHash?.slice(0, 5) + '...' + row?.transactionHash?.slice(-5, -1)}
                        </Link>
                      </Typography>
                    </Stack>
                  </StyledTableCell>
                </TableRow>
              ))}
              {/* {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )} */}
            </TableBody>
          </Table>
        </TableContainer>

        <Box bgcolor={'#fff'} pt={3} display={'flex'} justifyContent={'flex-end'}>
          <Pagination count={pageCount} onChange={handleChangePage} showFirstButton showLastButton shape="rounded" />
        </Box>
      </Stack>
    </Grid>
  );
}

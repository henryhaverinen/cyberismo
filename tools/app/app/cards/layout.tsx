/**
    Cyberismo
    Copyright © Cyberismo Ltd and contributors 2024

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public
    License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use client';
import { useState } from 'react';
import { TreeMenu } from '../components/TreeMenu';
import AppToolbar from '../components/AppToolbar';
import { CssBaseline, Snackbar } from '@mui/material';

import {
  Stack,
  Box,
  CircularProgress,
  Typography,
  styled,
  Container,
  Alert,
  IconButton,
} from '@mui/joy';
import { useProject } from '../lib/api';
import { SWRConfig } from 'swr';
import { getSwrConfig } from '../lib/swr';
import theme from '../theme';
import '../lib/i18n';
import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import { NewCardModal } from '../components/modals';
import StoreProvider from '../providers/StoreProvider';
import { useAppDispatch, useAppSelector, useAppRouter } from '../lib/hooks';
import { CloseRounded } from '@mui/icons-material';
import {
  closeNotification,
  removeNotification,
} from '../lib/slices/notifications';
import { useParams } from 'next/navigation';
import { findParentCard } from '../lib/utils';

function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Last URL parameter after /cards base is the card key
  const params = useParams<{ key?: string }>();
  const { project, error, isLoading, updateCard } = useProject();
  const router = useAppRouter();

  const notifications = useAppSelector(
    (state) => state.notifications.notifications,
  );

  const dispatch = useAppDispatch();

  if (isLoading)
    return (
      <Box padding={2}>
        <CircularProgress size="md" color="primary" />
      </Box>
    );

  if (error || !project) {
    return (
      <Container>
        <Typography level="body-md" color="danger">
          Could not open project:
        </Typography>
        <Typography level="body-md" color="danger">
          {error.message}
        </Typography>
      </Container>
    );
  }
  return (
    <Stack direction="row" height="100%">
      <Box width="274px" flexShrink={0}>
        <TreeMenu
          title={project.name}
          project={project}
          selectedCardKey={params.key ?? null}
          onMove={async (cardKey: string, newParent: string, index: number) => {
            const parent = findParentCard(project.cards, cardKey);
            await updateCard(cardKey, {
              parent: newParent === parent?.key ? undefined : newParent,
              index,
            });
          }}
          onCardSelect={(node) => {
            if (node.data.key) {
              router.safePush(`/cards/${node.data.key}`);
            }
          }}
        />
      </Box>
      <Box padding={2} flexGrow={1} overflow="hidden">
        {children}
      </Box>
      {notifications.map((notification, index) => (
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionProps={{
            onExited: () => dispatch(removeNotification(notification.id)),
          }}
          key={notification.id}
          open={!notification.closed}
          sx={{
            marginBottom: index * 8,
            transition: 'margin 0.5s',
          }}
          autoHideDuration={4000}
          onClose={(e) => {
            if (e === null) {
              // this means auto hide
              dispatch(closeNotification(notification.id));
            }
          }}
        >
          <Alert
            color={notification.type === 'error' ? 'danger' : 'success'}
            sx={{ width: '100%' }}
            endDecorator={
              <IconButton
                variant="plain"
                size="sm"
                color="neutral"
                onClick={() => {
                  dispatch(closeNotification(notification.id));
                }}
              >
                <CloseRounded />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}

const Main = styled('main')(({ theme }) => ({
  height: 'calc(100vh - 44px)', // 44px is the height of the toolbar
  flexGrow: 1,
}));

function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const params = useParams<{
    key?: string;
  }>();

  return (
    <Stack>
      <AppToolbar onNewCard={() => setIsCreateDialogOpen(true)} />
      <Main>
        <AppLayout>{children}</AppLayout>
      </Main>
      <NewCardModal
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        cardKey={params.key ?? null}
      />
    </Stack>
  );
}

const materialTheme = materialExtendTheme();

export default function CardsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider theme={theme}>
        <CssBaseline />
        <StoreProvider>
          <SWRConfig value={getSwrConfig()}>
            <Stack>
              <Main>
                <MainLayout>{children}</MainLayout>
              </Main>
            </Stack>
          </SWRConfig>
        </StoreProvider>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
}

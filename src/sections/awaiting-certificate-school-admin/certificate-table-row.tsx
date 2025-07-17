import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Box, Table, TableBody, TableHead, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import MenuItem from '@mui/material/MenuItem';
import CertificateStatusUpdateForm from './certificate-status-update-form';
import Tooltip from '@mui/material/Tooltip';
import Label from 'src/components/label';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function CertificateRow({ row, reload, path }) {
  const { t, i18n } = useTranslation();
  const { city, comments, gear, request_date, status, trainer, txn, user, vehicle_type = [] } = row;
  const router = useRouter();
  const popover = usePopover();
  const quickEdit = useBoolean();

  // Handle click on user, trainer, city, and vehicle type
  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.school.detailsadmin(user_id));
  };

  const handleTrainerDetails = (trainer_id) => {
    router.push(paths.dashboard.school.detailsadmin(trainer_id));
  };

  const handleCityDetails = (city_name) => {
    router.push(paths.dashboard.city.details(city_name));
  };

  const handleVehicleTypeDetails = (vehicle_type_name) => {
    router.push(paths.dashboard.category.details(vehicle_type_name));
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Typography variant="body2">
            {city?.city_translations?.find((item) => item?.locale === i18n.language)?.name ||
              t('n/a')}
          </Typography>
        </TableCell>

        <TableCell>{gear || t('n/a')}</TableCell>

        <TableCell>{request_date || t('n/a')}</TableCell>
        <TableCell>
          {city?.certificate_link ? (
            <a
              href={city.certificate_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  transition: 'text-decoration 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
              >
                {city.certificate_link}
              </span>
            </a>
          ) : (
            t('n/a')
          )}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              status === 'PENDING'
                ? 'warning'
                : status === 'REJECTED'
                ? 'error'
                : status === 'APPROVED'
                ? 'success'
                : 'default'
            }
            style={{ cursor: 'pointer' }}
          >
            {status === 'PENDING'
              ? 'Pending'
              : status === 'REJECTED'
              ? 'Rejected'
              : status === 'APPROVED'
              ? 'Approved'
              : t('n/a')}
          </Label>
        </TableCell>

        <TableCell>
          <Typography
            variant="body2"
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => handleTrainerDetails(trainer?.id)}
          >
            {trainer?.name || t('n/a')}
          </Typography>
        </TableCell>

        <TableCell>{txn?.id || t('n/a')}</TableCell>

        <TableCell>
          <Typography
            variant="body2"
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => handleUserDetails(user?.id)}
          >
            {user?.name || t('n/a')}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {vehicle_type?.category_translations[0]?.name || t('n/a')}
          </Typography>
        </TableCell>

        <TableCell>{comments || t('No Comments')}</TableCell>
      </TableRow>

      <CertificateStatusUpdateForm
        title="Update Status"
        currentCertificate={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={reload}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('Update Status')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}

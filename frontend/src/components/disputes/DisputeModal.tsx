import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Typography, Box,
  Stepper, Step, StepLabel, Alert, Divider,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { disputeService } from '../../services/dispute.service';
import type { Transaction } from '../../types';

const REASONS = [
  { value: 'UNAUTHORISED',        label: 'Unauthorised transaction' },
  { value: 'DUPLICATE',           label: 'Duplicate charge' },
  { value: 'INCORRECT_AMOUNT',    label: 'Incorrect amount' },
  { value: 'SERVICE_NOT_RECEIVED', label: 'Service not received' },
  { value: 'OTHER',               label: 'Other' },
];

const schema = z.object({
  reason: z.string().min(1, 'Please select a reason'),
  description: z.string().min(10, 'Please provide at least 10 characters').max(1000),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisputeModal({ open, transaction, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const values = watch();

  const handleClose = () => {
    reset();
    setStep(0);
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    if (step === 0) { setStep(1); return; }
    if (!transaction) return;
    setSubmitting(true);
    try {
      await disputeService.create(transaction.id, data.reason, data.description);
      enqueueSnackbar('Dispute submitted successfully', { variant: 'success' });
      reset();
      setStep(0);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      enqueueSnackbar(msg || 'Failed to submit dispute', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedReason = REASONS.find((r) => r.value === values.reason);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: 'none' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Raise a dispute</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {transaction?.merchant} — R{Number(transaction?.amount).toFixed(2)}
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <Stepper activeStep={step} sx={{ '& .MuiStepLabel-label': { fontSize: '0.8rem' } }}>
          <Step><StepLabel>Details</StepLabel></Step>
          <Step><StepLabel>Confirm</StepLabel></Step>
        </Stepper>
      </Box>

      <Divider />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          {step === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                {...register('reason')}
                select
                label="Reason for dispute"
                fullWidth
                error={!!errors.reason}
                helperText={errors.reason?.message}
                defaultValue=""
              >
                {REASONS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                {...register('description')}
                label="Description"
                multiline
                rows={4}
                fullWidth
                placeholder="Please describe the issue in detail..."
                error={!!errors.description}
                helperText={
                  errors.description?.message ||
                  `${(values.description || '').length}/1000 characters`
                }
                inputProps={{ maxLength: 1000 }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Please review your dispute before submitting. Once submitted it cannot be withdrawn.
              </Alert>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Transaction
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {transaction?.merchant}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  R{Number(transaction?.amount).toFixed(2)} — {new Date(transaction?.date || '').toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Reason
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {selectedReason?.label}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                  {values.description}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {step === 1 && (
            <Button onClick={() => setStep(0)} variant="outlined" sx={{ borderRadius: 2 }}>
              Back
            </Button>
          )}
          <Button onClick={handleClose} variant="text" color="inherit" sx={{ borderRadius: 2, color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              borderRadius: 2,
              background: step === 1
                ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                : undefined,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {step === 0 ? 'Next' : submitting ? 'Submitting...' : 'Submit dispute'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

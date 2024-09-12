import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button } from '@mui/material';

function ViewExplanationDialog({ open, onClose, explanation }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>查看解释信</DialogTitle>
      <DialogContent>
        <Typography>
          {explanation || '暂无解释信'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">关闭</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewExplanationDialog;
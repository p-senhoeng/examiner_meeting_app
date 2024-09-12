import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

function EditExplanationDialog({ open, onClose, explanation, onChange, onSave }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>编辑解释信</DialogTitle>
      <DialogContent>
        <TextField
          label="解释信"
          value={explanation}
          onChange={onChange}
          fullWidth
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">取消</Button>
        <Button onClick={onSave} color="primary">保存</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditExplanationDialog;
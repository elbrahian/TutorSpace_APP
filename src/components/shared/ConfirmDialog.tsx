import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

interface ConfirmDialogProps {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  open?: boolean;
}

export const ConfirmDialog = ({ mensaje, onConfirmar, onCancelar, open = true }: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancelar(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmación</DialogTitle>
          <DialogDescription>{mensaje}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancelar}>Cancelar</Button>
          <Button onClick={onConfirmar}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { Button } from "components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

interface SuccessKeyDialogProps {
  apiKey: string | null
  onClose: () => void
}

export function SuccessKeyDialog({ apiKey, onClose }: SuccessKeyDialogProps) {
  if (!apiKey) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogDescription>
            Copy your API key now. You won't be able to see it again.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 mt-4 bg-muted/50 border rounded-lg break-all font-mono">
          {apiKey}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

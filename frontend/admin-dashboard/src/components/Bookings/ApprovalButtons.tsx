interface ApprovalButtonsProps {
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalButtons({ onApprove, onReject }: ApprovalButtonsProps) {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 rounded-lg bg-ocean text-white" onClick={onApprove}>
        Approve
      </button>
      <button className="px-3 py-1 rounded-lg border text-red-600" onClick={onReject}>
        Reject
      </button>
    </div>
  );
}

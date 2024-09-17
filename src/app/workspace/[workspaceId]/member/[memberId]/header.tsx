import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMemberId } from "@/hooks/use-member-id";
import { usePanel } from "@/hooks/use-panel";
import { FaChevronDown } from "react-icons/fa";

interface HeaderProps {
  memberName?: string;
  memberImage?: string;
  onCLick?: () => void;
}

export const Header = ({
  memberImage,
  memberName = "Member",
  onCLick,
}: HeaderProps) => {
  const memberId = useMemberId();
  const avatarFallback = memberName.charAt(0).toUpperCase();
  const { onOpenProfile } = usePanel();

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <Button
        variant="ghost"
        className="text-lg font-semibold px-2 overflow-hidden w-auto"
        size="sm"
        onClick={() => onOpenProfile(memberId)}
      >
      <Avatar className="size-6 mr-2">
        <AvatarImage src={memberImage} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <span className="truncate">{memberName}</span>
      <FaChevronDown className="size-2.5 ml-2" />
      </Button>
    </div>
  );
};

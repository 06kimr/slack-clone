import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useUpdateMessagee } from "@/features/messages/api/use-update-message";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Hint } from "./hint";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useConfirm } from "@/hooks/use-confirm";
import { remove } from "../../convex/channels";
import { useToggleReactions } from "@/features/reactions/api/use-toggle-reactions";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages"> | undefined;
  memberId: Id<"members"> | undefined;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions:
    | Array<
        Omit<Doc<"reactions">, "memberId"> & {
          count: number;
          memberIds: Id<"members">[];
        }
      >
    | undefined;
  body: Doc<"messages">["body"] | undefined;
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"] | undefined;
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  threadName?: string
}

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
};

export const Message = ({
  id,
  isAuthor,
  memberId,
  authorImage,
  authorName = "Member",
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
  threadName
}: MessageProps) => {
  const { onOpenMessage, onClose, parentMessageId, onOpenProfile } = usePanel();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message",
    "Are you sure you want to delete this message? This can't be done"
  );
  const avatarFallback = authorName.charAt(0).toUpperCase();
  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessagee();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } =
    useToggleReactions();

  const isPending = isUpdatingMessage || isTogglingReaction;

  const handleUpdate = ({ body }: { body: string }) => {
    if (id) {
      updateMessage(
        { id, body },
        {
          onSuccess: () => {
            toast.success("Message updated");
            setEditingId(null);
          },
          onError: () => {
            toast.error("Failed to update message");
          },
        }
      );
    }
  };

  const handleRemove = async () => {
    const ok = await confirm();

    if (!ok) return;

    if (id !== undefined) {
      removeMessage(
        {
          id,
        },
        {
          onSuccess: () => {
            toast.success("Message deleted");

            if (parentMessageId === id) {
              onClose();
            }
          },
          onError: () => {
            toast.error("Failed to delete message");
          },
        }
      );
    }
  };

  const handleReaction = (value: string) => {
    toggleReaction(
      { messageId: id as Id<"messages">, value },
      {
        onError: () => {
          toast.error("Failed to toggle reaction");
        },
      }
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint
              label={formatFullTime(
                new Date(createdAt as Doc<"messages">["_creationTime"])
              )}
            >
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(
                  new Date(createdAt as Doc<"messages">["_creationTime"]),
                  "hh:mm"
                )}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body as string)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <Reactions
                  data={
                    reactions as Array<
                      Omit<Doc<"reactions">, "memberId"> & {
                        count: number;
                        memberIds: Id<"members">[];
                      }
                    >
                  }
                  onChange={handleReaction}
                />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id as Id<"messages">)}
                  name={threadName}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id as Id<"messages">)}
              handleThread={() => onOpenMessage(id as Id<"messages">)}
              handleDelete={handleRemove}
              hideThreadButton={hideThreadButton}
              handleReaction={handleReaction}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenProfile(memberId as Id<"members">)}>
            <Avatar className="rounded-md ">
              <AvatarImage src={authorImage} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body as string)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={() => onOpenProfile(memberId as Id<"members">)}
                  className="font-bold text-primary hover:underline"
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint
                  label={formatFullTime(
                    new Date(createdAt as Doc<"messages">["_creationTime"])
                  )}
                >
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(
                      new Date(createdAt as Doc<"messages">["_creationTime"]),
                      "h:mm a"
                    )}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions
                data={
                  reactions as Array<
                    Omit<Doc<"reactions">, "memberId"> & {
                      count: number;
                      memberIds: Id<"members">[];
                    }
                  >
                }
                onChange={handleReaction}
              />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                timestamp={threadTimestamp}
                name={threadName}
                onClick={() => onOpenMessage(id as Id<"messages">)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id as Id<"messages">)}
            handleThread={() => onOpenMessage(id as Id<"messages">)}
            handleDelete={handleRemove}
            hideThreadButton={hideThreadButton}
            handleReaction={handleReaction}
          />
        )}
      </div>
    </>
  );
};

import { useEffect, useState } from "react";
import { useGetTeamJoinLink } from "@/shared/api";

const useCopyLink = (team_id?: string) => {
  const [startCopied, setStartCopied] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { data: jointTeamLink, isLoading: jointTeamLinkLoading } =
    useGetTeamJoinLink(
      { team_id: team_id as string },
      { query: { enabled: startCopied && !!team_id } },
    );

  const handleCopyLink: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    setStartCopied(true);
    if (jointTeamLink) {
      navigator.clipboard.writeText(
        `${window.location.origin}${jointTeamLink}`,
      );
      setCopied(true);
      setStartCopied(false);
    }
  };

  const handleResetCopied = () => {
    setCopied(false);
  };

  useEffect(() => {
    if (jointTeamLink) {
      navigator.clipboard.writeText(
        `${window.location.origin}${jointTeamLink}`,
      );
      setCopied(true);
      setStartCopied(false);
    }
  }, [jointTeamLink]);

  return {
    copied,
    copyLoading: jointTeamLinkLoading,
    handleCopyLink,
    handleResetCopied,
  };
};

export { useCopyLink };

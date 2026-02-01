import { useState } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { useToast } from '../UI/Toast';
import '../../styles/share-button.css';

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  imageUrl?: string;
}

export default function ShareButton({ title, text, url, imageUrl }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const shareData = {
    title,
    text: text || title,
    url: url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('success', 'Shared successfully!');
        setShowOptions(false);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      setShowOptions(!showOptions);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowOptions(false);
  };

  const handleFacebookShare = () => {
    const shareUrl = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
    setShowOptions(false);
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(text || title);
    const tweetUrl = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
    setShowOptions(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('success', 'Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setShowOptions(false);
      }, 2000);
    } catch (err) {
      showToast('error', 'Failed to copy link');
    }
  };

  return (
    <div className="share-button-container">
      <button className="share-button" onClick={handleNativeShare}>
        <Share2 size={20} />
        <span>Share</span>
      </button>

      {showOptions && !navigator.share && (
        <>
          <div className="share-overlay" onClick={() => setShowOptions(false)} />
          <div className="share-options">
            <button className="share-option whatsapp" onClick={handleWhatsAppShare}>
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </button>

            <button className="share-option facebook" onClick={handleFacebookShare}>
              <Facebook size={20} />
              <span>Facebook</span>
            </button>

            <button className="share-option twitter" onClick={handleTwitterShare}>
              <Twitter size={20} />
              <span>Twitter</span>
            </button>

            <button className="share-option copy" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check size={20} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={20} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

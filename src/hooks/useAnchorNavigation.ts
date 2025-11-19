import { useEffect } from 'react';
import generateSlug from "@/utils/slug";



interface UseAnchorNavigationProps {
  location: {
    hash: string;
  };
  slides: Array<{
    name?: string;
    content?: string;
  }>;
  showSlideList: boolean;
  slideContainerRef?: React.RefObject<HTMLElement | null>;
  setCurrentSlide: (index: number) => void;
  setTransitionKey: (updater: (prev: number) => number) => void;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}
export default function useAnchorNavigation({ location, slides, showSlideList, setCurrentSlide, setTransitionKey, navigate }: UseAnchorNavigationProps) {
  useEffect(() => {
    if (location.hash && slides.length > 0 && !showSlideList) {
      const rawHash = decodeURIComponent(location.hash.replace('#', '')).trim();
      const normalizedHash = generateSlug(rawHash);

      setTimeout(() => {
        let element = document.getElementById(rawHash) || document.getElementById(rawHash.replace(/^-/, '')) || document.getElementById(normalizedHash) || document.getElementById(normalizedHash.replace(/^-/, ''));
        if (element) {
          try { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
          return;
        }

        const slideIndex = slides.findIndex((slide) => {
          let slideName = (slide.name || '').toLowerCase().trim();
          slideName = slideName.replace(/\.md$/, '');
          slideName = slideName.replace(/^\d+-/, '');
          const slug = generateSlug(slideName);
          const variations = [slideName, slug, slug.replace(/^-/, ''), slideName.replace(/^-/, ''), `-${slug}`, `-${slideName}`, (slide.name || '').toLowerCase().replace(/\.md$/, '')];
          return variations.includes(rawHash) || variations.includes(normalizedHash);
        });

        if (slideIndex !== -1) {
          setCurrentSlide(slideIndex);
          setTransitionKey((p) => p + 1);
          setTimeout(() => navigate('/app', { replace: true }), 120);
        }
      }, 90);
    }
  }, [location.hash, slides, showSlideList]);
}

export function ViewSlide(
  focusMode: boolean,
  presenterMode: boolean,
  thumbsRailRef: string,
  slides: string[],
) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {!focusMode && !presenterMode && (
          <aside
            className="thumbs-rail"
            ref={thumbsRailRef}
            aria-label="Lista de miniaturas"
          >
            <ul>
              {slides.map((s, idx) => {
                const active = idx === currentSlide;
                const previewText = (s.content || "")
                  .replace(/[#`>*_\-]/g, "")
                  .slice(0, 70);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      className={`thumb-item${active ? " active" : ""}`}
                      onClick={() => {
                        setCurrentSlide(idx);
                        setTransitionKey((prev) => prev + 1);
                      }}
                      aria-label={`Ir para slide ${idx + 1}`}
                    >
                      <span className="thumb-number">{idx + 1}</span>
                      <span className="thumb-text">
                        {previewText || "Slide vazio"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
        <div className="presentation-main">
          <div
            key={transitionKey}
            className={`slide-transition slide-transition-${slideTransition} `}
          >
            <SlideViewer
              html={slides[currentSlide].html}
              slideContainerRef={slideContainerRef}
              slideContentRef={slideContentRef}
            />
          </div>
        </div>
      </div>

      <Navigation
        currentSlide={currentSlide}
        slidesLength={slides.length}
        onPrev={() => {
          setCurrentSlide((s) => Math.max(0, s - 1));
          setTransitionKey((prev) => prev + 1);
        }}
        onNext={() => {
          setCurrentSlide((s) => Math.min(slides.length - 1, s + 1));
          setTransitionKey((prev) => prev + 1);
        }}
        onEdit={() => {
          setDraftContent(slides[currentSlide].content || "");
          setEditing(true);
        }}
        onToggleFocus={() => setFocusMode((v) => !v)}
        focusMode={focusMode}
        onExport={exportCombinedMarkdown}
        onDuplicate={duplicateSlide}
        onReset={() => {
          setSlides([]);
          setCurrentSlide(0);
          setError("");
          setShowSlideList(false);
          setPresenterMode(false);
        }}
        onExportPdf={() => exportSlideAsPdf(currentSlide)}
      />
    </>
  );
}

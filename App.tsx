import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Camera, Loader2, Moon, Sun, Palette } from "lucide-react";
import { Button } from "./components/ui/button";
import { useToast } from "./hooks/use-toast";
import { TemplateCard } from "./components/TemplateCard";
import { PhotoDisplay } from "./components/PhotoDisplay";
import { LoadingCard, ErrorCard } from "./components/LoadingCards";
import { CameraModal } from "./components/CameraModal";
import { UsageCounter } from "./components/UsageCounter";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { roomTypes, designStyles } from "./data/room-styles";
import { getOrientedImage, getImageDimensions, cropImage } from "./lib/image-utils";
import { generateImageWithRetry, getModelInstruction } from "./lib/ai-service";
import { getRemainingGenerations, incrementUsageCount, hasRemainingGenerations, MAX_GENERATIONS } from "./lib/usage-limit";

interface GeneratedImage {
  id: string;
  base: string;
  roomKey: string;
  styleKey: string;
  status: 'pending' | 'success' | 'failed';
  imageUrl: string | null;
}

const Index = () => {
  const { toast } = useToast();

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Main states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [inputAspectRatio, setInputAspectRatio] = useState<number | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(getRemainingGenerations());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Selection states
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Toggle theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Update remaining generations on mount
  useEffect(() => {
    setRemainingGenerations(getRemainingGenerations());
  }, []);

  const regenerateImageAtIndex = async (imageIndex: number) => {
    const imageToRegenerate = generatedImages[imageIndex];
    if (!imageToRegenerate) return;
    const { roomKey, styleKey, id } = imageToRegenerate;
    if (!roomKey || !styleKey) {
      toast({
        title: "Błąd",
        description: "Brakuje danych do regeneracji. Spróbuj wygenerować od nowa.",
        variant: "destructive"
      });
      return;
    }
    setGeneratedImages(prev => prev.map((img, index) => index === imageIndex ? {
      ...img,
      status: 'pending' as const
    } : img));
    const roomName = roomTypes[roomKey].name;
    const stylePrompt = designStyles[styleKey].base;
    try {
      const imageWithoutPrefix = uploadedImage!.split(',')[1];
      const modelInstruction = getModelInstruction(roomName, stylePrompt);
      
      // Swap order: Image first, then text prompt. This often helps the model context.
      const payload = {
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: imageWithoutPrefix
              }
            },
            {
              text: modelInstruction
            }
          ]
        }]
      };
      
      const imageUrl = await generateImageWithRetry(payload);
      setGeneratedImages(prev => prev.map((img, index) => index === imageIndex ? {
        ...img,
        status: 'success' as const,
        imageUrl
      } : img));
      toast({
        title: "Sukces!",
        description: "Obraz został wygenerowany ponownie."
      });
    } catch (err: any) {
      console.error(`Regeneration failed for ${id}:`, err);
      toast({
        title: "Błąd regeneracji",
        description: err.message || "Nie udało się wygenerować obrazu ponownie.",
        variant: "destructive"
      });
      setGeneratedImages(prev => prev.map((img, index) => index === imageIndex ? {
        ...img,
        status: 'failed' as const
      } : img));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const base64Image = await getOrientedImage(file);
        const { width, height } = await getImageDimensions(base64Image);
        setInputAspectRatio(width / height);
        setUploadedImage(base64Image);
        setGeneratedImages([]);
        toast({
          title: "Zdjęcie przesłane",
          description: "Teraz wybierz pomieszczenie i styl."
        });
      } catch (err) {
        console.error("Image upload error:", err);
        toast({
          title: "Błąd",
          description: "Nie można przetworzyć tego obrazu. Spróbuj użyć innego pliku.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCaptureConfirm = async (imageDataUrl: string) => {
    try {
      const { width, height } = await getImageDimensions(imageDataUrl);
      setInputAspectRatio(width / height);
      setUploadedImage(imageDataUrl);
      setGeneratedImages([]);
      toast({
        title: "Zdjęcie wykonane",
        description: "Teraz wybierz pomieszczenie i styl."
      });
    } catch (err) {
      console.error("Capture processing error:", err);
      toast({
        title: "Błąd",
        description: "Nie można przetworzyć tego obrazu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateClick = async () => {
    if (!uploadedImage) {
      toast({
        title: "Brak zdjęcia",
        description: "Proszę, prześlij najpierw zdjęcie!",
        variant: "destructive"
      });
      return;
    }
    if (!selectedRoom || !selectedStyle) {
      toast({
        title: "Brak wyboru",
        description: "Proszę wybrać pomieszczenie i styl!",
        variant: "destructive"
      });
      return;
    }
    if (!hasRemainingGenerations()) {
      toast({
        title: "Limit wyczerpany",
        description: "Wykorzystałeś wszystkie darmowe próby. Skontaktuj się z nami, aby odblokować pełną wersję.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
    const imageWithoutPrefix = uploadedImage.split(',')[1];
    const roomKey = selectedRoom;
    const styleKey = selectedStyle;
    const roomName = roomTypes[roomKey].name;
    const styleData = designStyles[styleKey];
    const stylePrompt = styleData.base;
    const styleId = styleData.name;
    const placeholders: GeneratedImage[] = Array(3).fill(null).map((_, index) => ({
      id: `${roomName} - ${styleId} (Wariant ${index + 1})`,
      base: stylePrompt,
      roomKey: roomKey,
      styleKey: styleKey,
      status: 'pending' as const,
      imageUrl: null
    }));
    setGeneratedImages(placeholders);
    const modelInstruction = getModelInstruction(roomName, stylePrompt);
    
    // Swap order: Image first, then text prompt.
    const payload = {
      contents: [{
        parts: [
           {
            inlineData: {
              mimeType: "image/png",
              data: imageWithoutPrefix
            }
          },
          {
            text: modelInstruction
          }
        ]
      }]
    };
    const promises = [generateImageWithRetry(payload), generateImageWithRetry(payload), generateImageWithRetry(payload)];
    const results = await Promise.allSettled(promises);
    const newGeneratedImages = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          ...placeholders[index],
          status: 'success' as const,
          imageUrl: result.value
        };
      } else {
        console.error(`Failed to generate image for ${placeholders[index].id}:`, result.reason);
        return {
          ...placeholders[index],
          status: 'failed' as const
        };
      }
    });
    setGeneratedImages(newGeneratedImages);
    setIsLoading(false);

    // Update usage count
    const newRemaining = incrementUsageCount();
    setRemainingGenerations(newRemaining);
    const successCount = newGeneratedImages.filter(img => img.status === 'success').length;
    if (successCount > 0) {
      toast({
        title: "Generowanie zakończone!",
        description: `Wygenerowano ${successCount} z 3 wizualizacji.`
      });
    } else {
      toast({
        title: "Błąd generowania",
        description: "Nie udało się wygenerować żadnej wizualizacji. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const triggerDownload = async (href: string, fileName: string) => {
    try {
      const response = await fetch(href);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Błąd pobierania",
        description: "Niestety, pobieranie nie powiodło się. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadRequest = async (imageUrl: string, era: string, ratio: string) => {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const safeEra = era.toLowerCase().replace(/\s+/g, '-');
    const safeRatio = ratio.replace(':', 'x');
    const fileName = `wnetrze-${safeEra}-${safeRatio}-${timestamp}.png`;
    try {
      const croppedImageUrl = await cropImage(imageUrl, ratio);
      await triggerDownload(croppedImageUrl, fileName);
      toast({
        title: "Pobrano!",
        description: "Obraz został zapisany na Twoim urządzeniu."
      });
    } catch (err) {
      console.error(`Failed to crop image for download:`, err);
      toast({
        title: "Błąd",
        description: "Nie można przygotować obrazu do pobrania.",
        variant: "destructive"
      });
    }
  };

  const handleStartOver = () => {
    setGeneratedImages([]);
    setUploadedImage(null);
    setSelectedRoom(null);
    setSelectedStyle(null);
    setInputAspectRatio(null);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const progress = generatedImages.length > 0 ? generatedImages.filter(img => img.status !== 'pending').length / generatedImages.length * 100 : 0;
  
  // Calculate dynamic style based on uploaded image aspect ratio
  // If no image is uploaded yet, default to video aspect ratio (16/9) or similar for placeholder
  const cardStyle = { 
    aspectRatio: inputAspectRatio ? `${inputAspectRatio}` : '16/9' 
  };
  
  const canGenerate = uploadedImage && selectedRoom && selectedStyle && !isLoading && !isUploading && hasRemainingGenerations();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <AnimatedBackground />
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCaptureConfirm} />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-background/50 backdrop-blur-md border-border hover:bg-background/80"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="relative z-10 flex flex-col items-center p-4 md:p-6 pb-20">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Header */}
          <header className="text-center my-12 md:my-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/20">
                <Palette className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
                RESTYLE AI
              </h1>
            </div>
            <p className="mt-4 text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto">
              Przekształć swoje wnętrze w kilka sekund. Wgraj zdjęcie, wybierz styl i pozwól AI stworzyć wizualizację.
            </p>
            <div className="mt-6 flex justify-center">
              <UsageCounter remaining={remainingGenerations} max={MAX_GENERATIONS} />
            </div>
          </header>

          {/* Main Form */}
          <main>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="glass rounded-3xl p-6 md:p-10 shadow-glass dark:shadow-glass-dark mb-16"
            >
              {/* Upload Section */}
              <div className="mb-10">
                <h2 className="text-lg md:text-xl font-bold mb-6 text-foreground tracking-tight flex items-center gap-3">
                  <span className="gradient-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold">1</span>
                  Prześlij swoje zdjęcie
                </h2>
                <div 
                  className="w-full border-2 border-dashed border-border rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-300 bg-muted/30 backdrop-blur-sm overflow-hidden"
                  style={uploadedImage ? cardStyle : { aspectRatio: '16/9' }}
                  onClick={() => !uploadedImage && fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute w-16 h-16 rounded-full bg-primary/20 animate-pulse-slow blur-xl" />
                        <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
                      </div>
                      <p className="text-muted-foreground mt-4 font-medium">Przesyłanie...</p>
                    </div>
                  ) : uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full gradient-upload flex items-center justify-center mb-4 shadow-primary">
                        <Upload className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-base font-bold text-foreground">Kliknij, aby przesłać plik</p>
                      <p className="mt-2 text-sm text-muted-foreground font-medium">lub</p>
                      <Button 
                        onClick={e => {
                          e.stopPropagation();
                          setIsCameraOpen(true);
                        }} 
                        variant="outline" 
                        className="mt-3"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Użyj kamery
                      </Button>
                    </div>
                  )}
                </div>
                {uploadedImage && !isUploading && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                      Zmień plik
                    </Button>
                    <Button onClick={() => setIsCameraOpen(true)} variant="outline" className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Użyj kamery
                    </Button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
              </div>

              {/* Room Selection */}
              <div className="mb-10">
                <h2 className="text-lg md:text-xl font-bold mb-6 text-foreground tracking-tight flex items-center gap-3">
                  <span className="gradient-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold">2</span>
                  Wybierz pomieszczenie
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {Object.entries(roomTypes).map(([key, data]) => (
                    <TemplateCard 
                      key={key} 
                      id={key} 
                      name={data.name} 
                      icon={data.icon} 
                      description={data.description} 
                      isSelected={selectedRoom === key} 
                      onSelect={setSelectedRoom}
                      color={data.color}
                      bgColor={data.bgColor}
                    />
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="mb-10">
                <h2 className="text-lg md:text-xl font-bold mb-6 text-foreground tracking-tight flex items-center gap-3">
                  <span className="gradient-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold">3</span>
                  Wybierz styl
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {Object.entries(designStyles).map(([key, data]) => (
                    <TemplateCard 
                      key={key} 
                      id={key} 
                      name={data.name} 
                      icon={data.icon} 
                      description={data.description} 
                      isSelected={selectedStyle === key} 
                      onSelect={setSelectedStyle}
                      color={data.color}
                      bgColor={data.bgColor}
                    />
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button 
                  onClick={handleGenerateClick} 
                  disabled={!canGenerate} 
                  size="lg" 
                  className="text-base md:text-lg px-10 md:px-14 py-6 md:py-7"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {`Generowanie... (${Math.round(progress)}%)`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Transformuj Wnętrze
                    </>
                  )}
                </Button>
                {!hasRemainingGenerations() && (
                  <p className="mt-4 text-destructive text-sm font-medium">
                    Wykorzystałeś wszystkie darmowe próby. Skontaktuj się z nami, aby odblokować pełną wersję.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Results Section */}
            <div ref={resultsRef}>
              {(isLoading || generatedImages.length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-16"
                >
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-8 text-center tracking-tight">
                    Wynik transformacji
                  </h2>

                  {isLoading && (
                    <div className="w-full max-w-md mx-auto mb-8 text-center">
                      <div className="bg-muted/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                        <motion.div 
                          className="gradient-primary h-3 rounded-full" 
                          initial={{ width: 0 }} 
                          animate={{ width: `${progress}%` }} 
                          transition={{ duration: 0.5 }} 
                        />
                      </div>
                      <p className="text-muted-foreground mt-4 text-sm font-medium">
                        Proszę, trzymaj to okno otwarte, dopóki generowanie nie zostanie ukończone.
                      </p>
                    </div>
                  )}
                  
                  {/* Changed from grid-cols-1 md:grid-cols-3 to grid-cols-1 to make images larger (original size) */}
                  <div className="grid grid-cols-1 gap-12 mt-12">
                    {generatedImages.map((img, index) => {
                      switch (img.status) {
                        case 'success':
                          return (
                            <PhotoDisplay 
                              key={`${img.id}-${index}-success`} 
                              era={img.id} 
                              imageUrl={img.imageUrl!} 
                              onDownload={handleDownloadRequest} 
                              onRegenerate={() => regenerateImageAtIndex(index)} 
                              style={cardStyle} 
                            />
                          );
                        case 'failed':
                          return (
                            <ErrorCard 
                              key={`${img.id}-${index}-failed`} 
                              onRegenerate={() => regenerateImageAtIndex(index)} 
                              style={cardStyle} 
                            />
                          );
                        case 'pending':
                        default:
                          return (
                            <LoadingCard 
                              key={`${img.id}-${index}-pending`} 
                              style={cardStyle} 
                            />
                          );
                      }
                    })}
                  </div>
                </motion.div>
              )}

              {!isLoading && generatedImages.length > 0 && (
                <div className="text-center mt-16 mb-12">
                  <Button onClick={handleStartOver} variant="outline" size="lg">
                    Zacznij od nowa
                  </Button>
                </div>
              )}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="text-center mt-16 border-t border-border pt-8 pb-4 animate-fade-in-up">
            <h3 className="text-lg font-bold text-foreground mb-2">Martin Andrzejewski</h3>
            <p className="font-medium mb-4" style={{ color: "#C0A062" }}>Optymalizacja i AI w Nieruchomościach</p>
            <p className="text-xs text-muted-foreground">© Martin Andrzejewski. Wszelkie prawa zastrzeżone.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
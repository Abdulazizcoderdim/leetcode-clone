import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
        <div className="flex flex-col justify-center gap-2 text-center text-4xl font-bold lg:text-5xl">
          <h1>Level up. Solve. Repeat.</h1>
          <h1 className="text-[#777]">Practice real coding. Get ranked.</h1>
          <div>
            <Button size="lg" className="rounded-full cursor-pointer">
              Start Coding
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

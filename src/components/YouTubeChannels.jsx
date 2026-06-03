import { Play } from "lucide-react";

export default function YouTubeChannels() {
  const channels = [
    {
      name: "ProspectEdu Official",
      subs: "1.2M subscribers",
      gradient: "bg-gradient-to-r from-[#A7E1B2] to-[#009846]",
      url: "https://www.youtube.com/channel/UCzRI182_8pdqfArUPYKRhnQ",
    },
    {
      name: "ProspectEdu IT Hub",
      subs: "480K subscribers",
      gradient: "bg-gradient-to-r from-[#C3EED0] to-[#6CCF88]",
      url: "https://www.youtube.com",
    },
    {
      name: "ProspectEdu Law Insights",
      subs: "365K subscribers",
      gradient: "bg-gradient-to-r from-[#E3F9E8] to-[#009846]",
      url: "https://www.youtube.com",
    },
    {
      name: "ProspectEdu Electrical Academy",
      subs: "290K subscribers",
      gradient: "bg-gradient-to-r from-[#C8F2D7] to-[#5BBF7A]",
      url: "https://www.youtube.com",
    },
    {
      name: "ProspectEdu Skill Academy",
      subs: "150K subscribers",
      gradient: "bg-gradient-to-r from-[#DFF9E6] to-[#A7E1B2]",
      url: "https://www.youtube.com",
    },
    {
      name: "ProspectEdu LearnX",
      subs: "92K subscribers",
      gradient: "bg-gradient-to-r from-[#A7E1B2] to-[#009846]",
      url: "https://www.youtube.com",
    },
    {
      name: "ProspectEdu Talks",
      subs: "67K subscribers",
      gradient: "bg-gradient-to-r from-[#E3F9E8] to-[#68C989]",
      url: "https://www.youtube.com",
    },
    {
      name: "ProspectEdu Updates",
      subs: "50K subscribers",
      gradient: "bg-gradient-to-r from-[#A7E1B2] to-[#009846]",
      url: "https://www.youtube.com",
    },
  ];

  return (
    <section
      className="w-full bg-[#F9FAFB] py-20"
      aria-labelledby="youtube-channels-heading"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">

        {/* Heading */}
        <h2
          id="youtube-channels-heading"
          className="text-3xl font-heading font-semibold text-[#124734] mb-12"
        >
          Explore ProspectEdu YouTube Learning Channels
        </h2>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {channels.map((channel, index) => (
            <article
              key={index}
              className="bg-white border border-[#A7E1B2] rounded-xl overflow-hidden shadow-sm 
                         hover:shadow-md transition-all duration-300 hover:scale-[1.03]"
              aria-label={channel.name}
            >
              {/* Gradient Banner */}
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${channel.name} YouTube channel`}
                className={`h-40 ${channel.gradient} flex items-center justify-center relative`}
              >
                <Play
                  className="w-12 h-12 text-white bg-[#124734]/70 rounded-full p-2 
                             hover:bg-[#009846] transition"
                  aria-hidden="true"
                />
              </a>

              {/* Channel Info */}
              <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-[#124734]">
                  {channel.name}
                </h3>
                <p className="text-sm text-[#5B7065] mt-1 font-body">
                  {channel.subs}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Explore Button */}
        <a
          href="https://www.youtube.com/channel/UCzRI182_8pdqfArUPYKRhnQ"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block px-8 py-3 rounded-full border border-[#009846] 
                     text-[#009846] text-lg font-medium hover:bg-[#009846] 
                     hover:text-white transition-all duration-300"
        >
          Explore ProspectEdu on YouTube
        </a>
      </div>
    </section>
  );
}

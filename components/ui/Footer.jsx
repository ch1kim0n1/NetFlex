import Logo from "../ui/Logo";
import Link from "next/link";
import { FaGithub, FaDiscord, FaTwitter } from 'react-icons/fa';

function Footer() {
  return (
    <>
      <footer className="mt-20 bg-netflix-dark border-t border-netflix-gray/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo hover={false} />
              <p className="text-netflix-text-gray text-sm pt-4 leading-relaxed">
                Stream unlimited movies and TV shows. Watch anywhere, anytime. 
                All content is provided through licensed streaming services.
              </p>
            </div>
            <div>
              <h3 className="text-netflix-white font-semibold mb-4">Browse</h3>
              <div className="space-y-3">
                <Link title="TV Shows Homepage" className="block text-netflix-text-gray hover:text-netflix-white transition-all" href="/shows">TV Shows</Link>
                <Link title="Movies Homepage" className="block text-netflix-text-gray hover:text-netflix-white transition-all" href="/movies">Movies</Link>
                <Link title="Trending Content" className="block text-netflix-text-gray hover:text-netflix-white transition-all" href="/trending">Trending</Link>
              </div>
            </div>
            <div>
              <h3 className="text-netflix-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a title="Community Discord Server" href="https://discord.com/invite/JQsvHC4JUH" target="_blank" rel="noreferrer" className="text-netflix-text-gray hover:text-netflix-white transition-all">
                  <FaDiscord size={24} />
                </a>
                <a title="NetFlex Source Code" href="https://github.com/ch1kim0n1/NetFlex" target="_blank" rel="noreferrer" className="text-netflix-text-gray hover:text-netflix-white transition-all">
                  <FaGithub size={24} />
                </a>
                <a title="ch1kim0n1's Twitter" href="https://x.com/ch1kim0n1" target="_blank" rel="noreferrer" className="text-netflix-text-gray hover:text-netflix-white transition-all">
                  <FaTwitter size={24} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-netflix-gray/30 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-netflix-text-gray text-sm">
              Made with ❤️ by <a title="ch1kim0n1" className="text-netflix-red hover:text-netflix-white underline transition-all" rel="noreferrer" target="_blank" href="https://j21.dev">ch1kim0n1</a>
            </p>
            <p className="text-netflix-text-gray text-sm mt-2 sm:mt-0">
              © 2024 NetFlex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
import Logo from "../ui/Logo";
import Link from "next/link";
import { FaGithub, FaDiscord, FaTwitter } from 'react-icons/fa';

function Footer() {
  return (
    <>
      <footer className="mt-20 bg-netflix-dark border-t border-netflix-gray/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <Logo hover={false} />
              <p className="text-netflix-text-gray text-sm pt-3 leading-relaxed">
                Stream unlimited movies and TV shows. Watch anywhere, anytime. 
                All content is provided through licensed streaming services.
              </p>
            </div>
            <div>
              <h3 className="text-netflix-white font-semibold mb-3">Browse</h3>
              <div className="space-y-2">
                <Link href="/shows" title="TV Shows Homepage" className="block text-netflix-text-gray hover:text-netflix-white transition-all cursor-pointer">
                  TV Shows
                </Link>
                <Link href="/movies" title="Movies Homepage" className="block text-netflix-text-gray hover:text-netflix-white transition-all cursor-pointer">
                  Movies
                </Link>
                <Link href="/trending" title="Trending Content" className="block text-netflix-text-gray hover:text-netflix-white transition-all cursor-pointer">
                  Trending
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-netflix-white font-semibold mb-3">Connect</h3>
              <div className="flex space-x-4">
                <a 
                  title="Community Discord Server" 
                  href="https://discord.com/invite/JQsvHC4JUH" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-netflix-text-gray hover:text-netflix-white transition-all cursor-pointer hover:scale-110 transform duration-200"
                >
                  <FaDiscord size={24} />
                </a>
                <a 
                  title="NetFlex Source Code" 
                  href="https://github.com/ch1kim0n1/NetFlex" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-netflix-text-gray hover:text-netflix-white transition-all cursor-pointer hover:scale-110 transform duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a 
                  title="ch1kim0n1's Twitter" 
                  href="https://x.com/ch1kim0n1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-netflix-text-gray hover:text-netflix-white transition-all cursor-pointer hover:scale-110 transform duration-200"
                >
                  <FaTwitter size={24} />
                </a>
              </div>
            </div>
            <div>
              <div className="bg-netflix-gray/20 border border-netflix-gray/40 rounded-lg p-4">
                <h4 className="text-netflix-white font-semibold text-sm mb-2">⚠️ Disclaimer</h4>
                <p className="text-netflix-text-gray text-xs leading-relaxed">
                  NetFlex does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-netflix-gray/30 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-netflix-text-gray text-sm">
              Made with ❤️ by <a 
                title="ch1kim0n1" 
                className="text-netflix-red hover:text-netflix-white underline transition-all cursor-pointer" 
                rel="noopener noreferrer" 
                target="_blank" 
                href="https://j21.dev"
              >
                ch1kim0n1
              </a>
            </p>
            <p className="text-netflix-text-gray text-sm mt-2 sm:mt-0">
              © 2025 NetFlex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
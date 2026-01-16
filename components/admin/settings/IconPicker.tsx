
import {
    Activity, Airplay, AlertCircle, AlertTriangle, AlignCenter, AlignJustify, AlignLeft, AlignRight,
    Anchor, Aperture, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, AtSign, Award, BarChart,
    BarChart2, Battery, BatteryCharging, Bell, BellOff, Bluetooth, Bold, Book, BookOpen, Bookmark,
    Box, Briefcase, Calendar, Camera, Cast, Check, CheckCircle, CheckSquare, ChevronDown, ChevronLeft,
    ChevronRight, ChevronUp, ChevronsDown, ChevronsLeft, ChevronsRight, ChevronsUp, Chrome, Circle,
    Clipboard, Clock, Cloud, CloudDrizzle, CloudLightning, CloudOff, CloudRain, CloudSnow, Code,
    Codepen, Codesandbox, Coffee, Columns, Command, Compass, Copy, CornerDownLeft, CornerDownRight,
    CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, CornerUpLeft, CornerUpRight, Cpu,
    CreditCard, Crop, Crosshair, Database, Delete, Disc, DollarSign, Download, DownloadCloud, Droplet,
    Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff, Facebook, FastForward, Feather, Figma, File,
    FileMinus, FilePlus, FileText, Film, Filter, Flag, Folder, FolderMinus, FolderPlus, Framer,
    Frown, Gift, GitBranch, GitCommit, GitMerge, GitPullRequest, Github, Gitlab, Globe, Grid,
    HardDrive, Hash, Headphones, Heart, HelpCircle, Hexagon, Home, Image, Inbox, Info, Instagram,
    Italic, Key, Layers, Layout, LifeBuoy, Link, Link2, Linkedin, List, Loader, Lock, LogIn,
    LogOut, Mail, Map, MapPin, Maximize, Maximize2, Meh, Menu, MessageCircle, MessageSquare,
    Mic, MicOff, Minimize, Minimize2, Minus, MinusCircle, MinusSquare, Monitor, Moon, MoreHorizontal,
    MoreVertical, MousePointer, Move, Music, Navigation, Network, Octagon, Package, Paperclip,
    Pause, PauseCircle, PenTool, Percent, Phone, PhoneCall, PhoneForwarded, PhoneIncoming, PhoneMissed,
    PhoneOff, PhoneOutgoing, PieChart, Play, PlayCircle, Plus, PlusCircle, PlusSquare, Pocket, Power,
    Printer, Radio, RefreshCcw, RefreshCw, Repeat, Rewind, RotateCcw, RotateCw, Rss, Save, Scissors,
    Search, Send, Server, Settings, Share, Share2, Shield, ShieldOff, ShoppingBag, ShoppingCart,
    Shuffle, Sidebar, SkipBack, SkipForward, Slack, Slash, Sliders, Smartphone, Smile, Speaker,
    Square, Star, StopCircle, Sun, Sunrise, Sunset, Tablet, Tag, Target, Terminal, Thermometer,
    ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight, Trash, Trash2, TrendingDown, TrendingUp,
    Triangle, Truck, Tv, Twitch, Twitter, Type, Umbrella, Underline, Unlock, Upload, UploadCloud,
    User, UserCheck, UserMinus, UserPlus, UserX, Users, Video, VideoOff, Voicemail, Volume, Volume1,
    Volume2, VolumeX, Watch, Wifi, WifiOff, Wind, X, XCircle, XOctagon, XSquare, Youtube, Zap,
    ZapOff, ZoomIn, ZoomOut, Handshake, HeartHandshake, Building2
} from "lucide-react";
import React, { useState } from "react";

const ICON_LIST = {
    // Common
    Activity, AlertCircle, AlertTriangle, Archive, ArrowRight, Award, BarChart2, Bell, Book, BookOpen,
    Bookmark, Box, Briefcase, Calendar, Check, CheckCircle, ChevronRight, Clock, Cloud, Code, Copy,
    CreditCard, Database, Download, Edit, Edit2, ExternalLink, Eye, File, FileText, Filter, Flag,
    Folder, Gift, Globe, Grid, HardDrive, Heart, HelpCircle, Home, Image, Inbox, Info, Key, Layers,
    Layout, Link, List, Lock, LogIn, LogOut, Mail, Map, MapPin, Menu, MessageCircle, MessageSquare,
    Mic, Monitor, Moon, MoreHorizontal, Music, Package, Paperclip, Phone, PieChart, Play, PlayCircle,
    Plus, Power, Printer, Radio, RefreshCw, Save, Search, Send, Server, Settings, Share, Share2,
    Shield, ShoppingBag, ShoppingCart, Smartphone, Smile, Speaker, Star, Sun, Tablet, Tag, Target,
    Terminal, ThumbsUp, PenTool, Trash2, TrendingUp, Truck, Tv, Type, Unlock, Upload, User, Users,
    Video, Watch, Wifi, X, Zap, Handshake, HeartHandshake, Building2
};

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    align?: "left" | "right";
}

export const IconPicker = ({ value, onChange, align = "left" }: IconPickerProps) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = Object.keys(ICON_LIST).filter(iconName =>
        iconName.toLowerCase().includes(search.toLowerCase())
    );

    const SelectedIcon = (ICON_LIST as any)[value] || HelpCircle;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition w-full md:w-auto"
            >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <SelectedIcon size={18} />
                </div>
                <span className="font-medium text-slate-700">{value || "Select Icon"}</span>
                <ChevronDown size={16} className="text-slate-400 ml-auto" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`absolute top-full mt-2 w-64 xs:w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] p-4 animate-in fade-in zoom-in-95 duration-200 ${align === "right" ? "right-0" : "left-0"
                        }`}>
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-sm focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {filteredIcons.map((iconName) => {
                                const Icon = (ICON_LIST as any)[iconName];
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                            onChange(iconName);
                                            setIsOpen(false);
                                        }}
                                        className={`p-2 rounded-lg flex items-center justify-center hover:bg-slate-100 transition aspect-square ${value === iconName ? "bg-blue-50 text-blue-600 ring-1 ring-blue-500" : "text-slate-500"
                                            }`}
                                        title={iconName}
                                    >
                                        <Icon size={20} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

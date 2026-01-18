/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Train, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center animated-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8">
          <Train className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display text-7xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! This train has derailed. Page not found.
        </p>
        <Button asChild variant="hero" size="lg">
          <Link to="/">
            <Home className="w-5 h-5 mr-2" />
            Return to Station
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
